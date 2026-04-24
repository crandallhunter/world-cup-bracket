import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Submission, UsedToken } from '@/lib/db/types';
import {
  getDivisionForHoldings,
  isTournamentLocked,
  type NFTHoldings,
} from '@/lib/divisions';
import { FUTBOL_CONTRACT, MEEBIT_CONTRACT } from '@/lib/web3/nftContract';

/**
 * POST /api/submit
 * Submit a bracket. Accepts wallet-based or email-based submissions.
 *
 * Body:
 * {
 *   identityType: 'wallet' | 'email',
 *   identifier: string,              // wallet address or email
 *   // Per-contract token IDs the client claims the wallet holds. The server
 *   // re-validates by filtering out any that are already locked by another
 *   // submission. Empty arrays are fine.
 *   futbolTokenIds?: string[],
 *   meebitTokenIds?: string[],
 *   // Bracket data
 *   groupStandings, qualifiedThirdPlace, knockoutPicks, champion?, finalScore?
 * }
 */
export async function POST(req: NextRequest) {
  try {
    if (isTournamentLocked()) {
      return NextResponse.json(
        { error: 'Tournament has started — submissions are locked.' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      identityType,
      identifier,
      futbolTokenIds = [],
      meebitTokenIds = [],
      groupStandings,
      qualifiedThirdPlace,
      knockoutPicks,
      champion,
      finalScore,
    } = body;

    // ── Validation ──
    if (!identityType || !identifier) {
      return NextResponse.json({ error: 'Missing identity.' }, { status: 400 });
    }
    if (!groupStandings || !knockoutPicks) {
      return NextResponse.json({ error: 'Missing bracket data.' }, { status: 400 });
    }

    const normalizedId = identifier.toLowerCase();

    // ── Reject duplicate submissions ──
    const existing = await db.getSubmissionByIdentity(normalizedId);
    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted a bracket. Use the upgrade endpoint to change divisions.' },
        { status: 409 },
      );
    }

    // ── Resolve eligible holdings ──
    // The client sends what it *thinks* the wallet holds. We filter out any
    // token IDs already locked by a prior submission on the same contract,
    // per-contract so identical token IDs across contracts don't collide.
    let cleanFutbolIds: string[] = [];
    let cleanMeebitIds: string[] = [];

    if (identityType === 'wallet') {
      if (Array.isArray(futbolTokenIds) && futbolTokenIds.length > 0) {
        const usedFutbol = await db.filterUsedTokens(FUTBOL_CONTRACT.address, futbolTokenIds);
        cleanFutbolIds = (futbolTokenIds as string[]).filter((id) => !usedFutbol.includes(id));
      }
      if (Array.isArray(meebitTokenIds) && meebitTokenIds.length > 0) {
        const usedMeebit = await db.filterUsedTokens(MEEBIT_CONTRACT.address, meebitTokenIds);
        cleanMeebitIds = (meebitTokenIds as string[]).filter((id) => !usedMeebit.includes(id));
      }
    }

    const holdings: NFTHoldings = {
      futbolCount: cleanFutbolIds.length,
      meebitCount: cleanMeebitIds.length,
    };

    const division = getDivisionForHoldings(holdings);

    // ── Persist submission + token locks in a consistent order ──
    const now = Date.now();
    const submission: Submission = {
      id: crypto.randomUUID(),
      identityType,
      identifier: normalizedId,
      divisionId: division.id,
      // Flat list retained for backwards compat with callers that read the
      // Submission row; the canonical per-contract breakdown lives in the
      // used_tokens table.
      lockedTokenIds: [...cleanFutbolIds, ...cleanMeebitIds],
      submittedAt: now,
      groupStandings,
      qualifiedThirdPlace,
      knockoutPicks,
      champion,
      finalScore,
    };

    await db.createSubmission(submission);

    const locks: UsedToken[] = [
      ...cleanFutbolIds.map((tokenId) => ({
        tokenId,
        contractAddress: FUTBOL_CONTRACT.address,
        submissionId: submission.id,
        walletAddress: normalizedId,
        lockedAt: now,
      })),
      ...cleanMeebitIds.map((tokenId) => ({
        tokenId,
        contractAddress: MEEBIT_CONTRACT.address,
        submissionId: submission.id,
        walletAddress: normalizedId,
        lockedAt: now,
      })),
    ];

    if (locks.length > 0) {
      await db.lockTokens(locks);
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      divisionId: division.id,
      divisionName: division.name,
      lockedFutbolCount: cleanFutbolIds.length,
      lockedMeebitCount: cleanMeebitIds.length,
    });
  } catch (err) {
    console.error('[Submit API] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * GET /api/submit?identifier=0x...
 * Check if a user has already submitted a bracket.
 *
 * GET /api/submit?id=<submissionId>
 * Fetch a full submission by its ID (for the bracket detail page).
 */
export async function GET(req: NextRequest) {
  const submissionId = req.nextUrl.searchParams.get('id');
  if (submissionId) {
    const submission = await db.getSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json({ exists: false });
    }
    return NextResponse.json({ exists: true, submission });
  }

  const identifier = req.nextUrl.searchParams.get('identifier');
  if (!identifier) {
    return NextResponse.json({ error: 'Missing identifier or id.' }, { status: 400 });
  }

  const submission = await db.getSubmissionByIdentity(identifier.toLowerCase());
  if (!submission) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({
    exists: true,
    submissionId: submission.id,
    divisionId: submission.divisionId,
    submittedAt: submission.submittedAt,
    champion: submission.champion,
  });
}
