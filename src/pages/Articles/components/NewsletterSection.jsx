import { resolveMediaUrl } from '../../../services/apiBaseUrl';
import { homeImages } from '../../../content/siteImages';

function formatIssueDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
}

const NewsletterSection = ({ newsletters = [] }) => {
  if (!newsletters.length) return null;

  const [featured] = newsletters;
  const pdfUrl = resolveMediaUrl(featured.pdf_url);
  const coverUrl = featured.cover_image_url
    ? resolveMediaUrl(featured.cover_image_url)
    : homeImages.catastrophicFireFirm2;

  return (
    <aside className="newsletter-callout" aria-labelledby="newsletter-callout-heading">
      <p id="newsletter-callout-heading" className="newsletter-callout-label">
        Check this out
      </p>

      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="newsletter-callout-link"
      >
        <span className="newsletter-callout-cover">
          <img src={coverUrl} alt="" loading="lazy" />
        </span>
        <span className="newsletter-callout-body">
          <span className="newsletter-callout-eyebrow">Firm Newsletter</span>
          {featured.issue_date && (
            <time dateTime={featured.issue_date} className="newsletter-callout-date">
              {formatIssueDate(featured.issue_date)}
            </time>
          )}
          <span className="newsletter-callout-title">{featured.title}</span>
          <span className="newsletter-callout-cta">Read latest issue →</span>
        </span>
      </a>
    </aside>
  );
};

export default NewsletterSection;
