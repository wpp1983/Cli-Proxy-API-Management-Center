import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './UsageStatPage.module.scss';

const USAGE_KEEPER_URL_STORAGE_KEY = 'cpa_usage_keeper_url';

const resolveUsageKeeperUrl = (): string => {
  const configured = String(import.meta.env.VITE_USAGE_KEEPER_URL || '').trim();
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window === 'undefined') return '';
  return String(window.localStorage.getItem(USAGE_KEEPER_URL_STORAGE_KEY) || '')
    .trim()
    .replace(/\/$/, '');
};

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export function UsageStatPage() {
  const { t } = useTranslation();
  const initialUrl = useMemo(() => resolveUsageKeeperUrl(), []);
  const [usageKeeperUrl, setUsageKeeperUrl] = useState(initialUrl);
  const [draftUrl, setDraftUrl] = useState(initialUrl);

  useEffect(() => {
    setDraftUrl(usageKeeperUrl);
  }, [usageKeeperUrl]);

  const saveUrl = () => {
    const normalized = normalizeUrl(draftUrl);
    setUsageKeeperUrl(normalized);
    if (normalized) {
      window.localStorage.setItem(USAGE_KEEPER_URL_STORAGE_KEY, normalized);
    } else {
      window.localStorage.removeItem(USAGE_KEEPER_URL_STORAGE_KEY);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('usage_stat.title')}</h1>
          <p className={styles.description}>{t('usage_stat.description')}</p>
        </div>
        {usageKeeperUrl && (
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setUsageKeeperUrl(`${usageKeeperUrl}?reload=${Date.now()}`)}
            >
              {t('usage_stat.reload_dashboard')}
            </button>
            <a
              className="btn btn-primary"
              href={usageKeeperUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t('usage_stat.open_dashboard')}
            </a>
          </div>
        )}
      </div>

      <div className={styles.urlBar}>
        <label className={styles.urlLabel} htmlFor="usage-keeper-url">
          {t('usage_stat.dashboard_url')}
        </label>
        <input
          id="usage-keeper-url"
          className="input"
          value={draftUrl}
          placeholder="https://your-usage-keeper.example.com"
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveUrl();
          }}
        />
        <button type="button" className="btn btn-secondary" onClick={saveUrl}>
          {t('usage_stat.save_url')}
        </button>
      </div>

      {usageKeeperUrl ? (
        <iframe
          title={t('usage_stat.iframe_title')}
          src={usageKeeperUrl}
          className={styles.iframe}
        />
      ) : (
        <div className={styles.emptyState}>
          <h2>{t('usage_stat.empty_title')}</h2>
          <p>{t('usage_stat.empty_desc')}</p>
        </div>
      )}
    </div>
  );
}
