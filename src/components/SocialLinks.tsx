import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label?: string | null;
  display_order: number;
}

/**
 * Maps internal platform slugs to simple-icons slugs and accessible labels.
 * Icons are fetched on-demand from https://cdn.simpleicons.org (auto from the internet),
 * then recolored via CSS mask so they always match the site palette.
 */
const PLATFORM_META: Record<string, { slug: string; label: string }> = {
  linkedin:  { slug: 'linkedin',  label: 'LinkedIn' },
  instagram: { slug: 'instagram', label: 'Instagram' },
  facebook:  { slug: 'facebook',  label: 'Facebook' },
  x:         { slug: 'x',         label: 'X' },
  twitter:   { slug: 'x',         label: 'X (Twitter)' },
  tiktok:    { slug: 'tiktok',    label: 'TikTok' },
  youtube:   { slug: 'youtube',   label: 'YouTube' },
  whatsapp:  { slug: 'whatsapp',  label: 'WhatsApp' },
  telegram:  { slug: 'telegram',  label: 'Telegram' },
  discord:   { slug: 'discord',   label: 'Discord' },
  github:    { slug: 'github',    label: 'GitHub' },
  kawai:     { slug: 'kakaotalk', label: 'Kawai' },
  pinterest: { slug: 'pinterest', label: 'Pinterest' },
  threads:   { slug: 'threads',   label: 'Threads' },
  reddit:    { slug: 'reddit',    label: 'Reddit' },
  twitch:    { slug: 'twitch',    label: 'Twitch' },
  spotify:   { slug: 'spotify',   label: 'Spotify' },
  snapchat:  { slug: 'snapchat',  label: 'Snapchat' },
  medium:    { slug: 'medium',    label: 'Medium' },
  behance:   { slug: 'behance',   label: 'Behance' },
  dribbble:  { slug: 'dribbble',  label: 'Dribbble' },
};

const SocialIcon = ({ slug, label }: { slug: string; label: string }) => {
  // Use simple-icons SVG as a CSS mask so the fill follows currentColor (site palette).
  const url = `https://cdn.simpleicons.org/${slug}/ffffff`;
  const style: React.CSSProperties = {
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    backgroundColor: 'currentColor',
  };
  return <span aria-hidden="true" role="img" aria-label={label} style={style} className="block h-6 w-6" />;
};

const SocialLinks = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    api.get('/social-links').then((data) => setLinks(data || [])).catch(() => setLinks([]));
  }, []);

  if (links.length === 0) return null;

  return (
    <div className="mt-10 text-center">
      <h3 className="text-lg font-semibold text-foreground mb-1">Siga a OptiStrat</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Acompanhe nossas novidades e conteúdos nas redes sociais
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-3">
        {links.map((link) => {
          const meta = PLATFORM_META[link.platform] || { slug: link.platform, label: link.platform };
          return (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label || meta.label}
                title={link.label || meta.label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <SocialIcon slug={meta.slug} label={meta.label} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SocialLinks;