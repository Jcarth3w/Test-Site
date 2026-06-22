import { resolveMediaUrl } from '../../../services/apiBaseUrl';
import { homeImages } from '../../../content/siteImages';

function formatIssueDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
}

function NewsletterCard({ newsletter, featured = false }) {
  const pdfUrl = resolveMediaUrl(newsletter.pdf_url);
  const coverUrl = newsletter.cover_image_url
    ? resolveMediaUrl(newsletter.cover_image_url)
    : homeImages.catastrophicFireFirm2;

  return (
    <article className={`newsletter-card ${featured ? 'newsletter-card--featured' : ''}`}>
      <div className="newsletter-card-media">
        <img src={coverUrl} alt="" loading="lazy" />
        <span className="newsletter-card-badge">PDF</span>
      </div>
      <div className="newsletter-card-body">
        {newsletter.issue_date && (
          <time dateTime={newsletter.issue_date} className="newsletter-card-date">
            {formatIssueDate(newsletter.issue_date)}
          </time>
        )}
        <h3>{newsletter.title}</h3>
        {newsletter.summary && <p>{newsletter.summary}</p>}
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="newsletter-card-cta"
        >
          {featured ? 'Read latest issue →' : 'Download PDF →'}
        </a>
      </div>
    </article>
  );
}

const NewsletterSection = ({ newsletters = [] }) => {
  if (!newsletters.length) return null;

  const [featured, ...archive] = newsletters;

  return (
    <section className="newsletter-section" aria-labelledby="newsletter-section-heading">
      <div className="newsletter-section-header">
        <div>
          <p className="newsletter-section-eyebrow">Firm Newsletter</p>
          <h2 id="newsletter-section-heading">Latest issue and archive</h2>
          <p className="newsletter-section-lead">
            Read the firm&apos;s internal newsletter online, or browse previous issues below.
          </p>
        </div>
      </div>

      <NewsletterCard newsletter={featured} featured />

      {archive.length > 0 && (
        <div className="newsletter-archive">
          <h3 className="newsletter-archive-heading">Previous issues</h3>
          <div className="newsletter-archive-grid">
            {archive.map((newsletter) => (
              <NewsletterCard key={newsletter.id} newsletter={newsletter} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default NewsletterSection;
