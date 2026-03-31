'use client';

import type { Team } from '@/types/tournament';
import { Button } from '@/components/ui/Button';
import { getFlagEmoji } from '@/lib/tournament/teams';

interface ShareCardProps {
  champion?: Team;
}

export function ShareCard({ champion }: ShareCardProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://worldcupbracket.app';
  const championName = champion?.name ?? 'my pick';
  const championFlag = champion ? getFlagEmoji(champion.flagCode) : '🏆';

  const tweetText = `I just submitted my 2026 FIFA World Cup bracket! 🏆⚽\nMy pick to win it all: ${championFlag} ${championName}\n${appUrl}\n#WorldCup2026 #BracketChallenge`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="space-y-3">
      {/* Preview tweet */}
      <div className="bg-surface-3 rounded-xl p-4 border border-border text-sm text-text-secondary whitespace-pre-line leading-relaxed">
        {tweetText}
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => window.open(tweetUrl, '_blank', 'noopener,noreferrer')}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X (Twitter)
      </Button>
    </div>
  );
}
