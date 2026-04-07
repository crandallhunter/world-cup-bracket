import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Submission } from '@/lib/db/types';
import { getDivisionForCount, isTournamentLocked } from '@/lib/divisions';

/**
 * POST /api/submit
 * Submit a bracket. Accepts wallet-based or email-based submissions.
 *
 * Body:
 * {
 *   identityType: 'wallet' | 'email',
 *   identifier: string,          // wallet address or email
 *   tokenIds?: string[],         // token IDs held (wallet only, from Alchemy)
 *   groupStandings: ...,
 *   qualifiedThirdPlace: ...,
 *   knockoutPicks: ...,
 *   champion?: ...,
 *   finalScore?: ...,
 * }
 */
export async function POST(req: NextRequest) {
  try {
    if (isTournamentLocked()) {
      return NextResponse.json(
        { error: 'Tournament has started — submissions are locked.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      identityType,
      identifier,
      tokenIds = [],
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

    // ── Check for existing submission ──
    const existing = await db.getSubmissionByIdentity(normalizedId);
    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted a bracket. Use the upgrade endpoint to change divisions.' },
        { status: 409 }
      );
    }

    // ── Determine division ──
    let eligibleCount = 0;
    let lockedTokenIds: string[] = [];

    if (identityType === 'wallet' && tokenIds.length > 0) {
      // Filter out token IDs that are already used by other submissions
      const usedIds = await db.filterUsedTokens(tokenIds);
      const cleanIds = tokenIds.filter((id: string) => !usedIds.includes(id));
      eligibleCount = cleanIds.length;
      lockedTokenIds = cleanIds;
    }
    // Email users and wallet users with 0 NFTs → Open tier (eligibleCount stays 0)

    const division = getDivisionForCount(eligibleCount);

    // ── Create submission ──
    const submission: Submission = {
      id: crypto.randomUUID(),
      identityType,
      identifier: normalizedId,
      divisionId: division.id,
      lockedTokenIds,
      submittedAt: Date.now(),
      groupStandings,
      qualifiedThirdPlace,
      knockoutPicks,
      champion,
      finalScore,
    };

    await db.createSubmission(submission);

    // Lock token IDs (wallet users only)
    if (lockedTokenIds.length > 0) {
      await db.lockTokens(
        lockedTokenIds.map((tokenId) => ({
          tokenId,
          submissionId: submission.id,
          walletAddress: normalizedId,
          lockedAt: Date.now(),
        }))
      );
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      divisionId: division.id,
      divisionName: division.name,
      lockedTokenCount: lockedTokenIds.length,
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
  // ── Fetch full submission by ID ──
  const submissionId = req.nextUrl.searchParams.get('id');
  if (submissionId) {
    const submission = await db.getSubmissionById(submissionId);
    if (!submission) {
      return NextResponse.json({ exists: false });
    }
    return NextResponse.json({ exists: true, submission });
  }

  // ── Check by identity ──
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
