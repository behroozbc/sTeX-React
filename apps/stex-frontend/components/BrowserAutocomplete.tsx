import {
  Autocomplete,
  Box,
  createFilterOptions,
  TextField,
} from '@mui/material';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  FileLocation,
  fixDuplicateLabels,
  PathToArticle,
} from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { getArticleList } from '../file-structure';
import styles from '../index.module.scss';

interface BrowserItem extends FileLocation {
  label: string;
  language: string;
}

function getBrowserItems(browserItems: { [archive: string]: string[] }) {
  const items: BrowserItem[] = [];
  for (const [archive, files] of Object.entries(browserItems)) {
    for (const filepath of files) {
      const filename = filepath.substring(filepath.lastIndexOf('/') + 1);
      let label = filename.substring(0, filename.length - 6);

      const langStart = label.lastIndexOf('.');
      const language = langStart === -1 ? '' : label.substring(langStart + 1);

      if (langStart !== -1) {
        label = label.substring(0, langStart) + ` (${language})`;
      }

      items.push({ archive, filepath, label, language });
    }
  }
  return fixDuplicateLabels(items);
}

function OptionDisplay({ item }: { item: BrowserItem }) {
  const flag =
    { de: 'de', en: 'gb', zhs: 'cn', fr: 'fr' }[item.language] || 'gb';
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element*/}
      <img
        loading="lazy"
        width="20"
        src={`https://flagcdn.com/w20/${flag}.png`}
        srcSet={`https://flagcdn.com/w40/${flag}.png 2x`}
        alt=""
        style={{ marginRight: '10px' }}
      />
      <span>{item.label}</span>
      <span className={styles['brower_autocomplete_project']}>
        {item.archive}
      </span>
    </>
  );
}

// Limit number of options rendered at a time to improve performance.
const filterOptions = createFilterOptions({
  matchFrom: 'any',
  limit: 70,
});

export function BrowserAutocomplete() {
  const router = useRouter();

  const [browserItems, setBrowserItems] = useState<BrowserItem[]>([]);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    getArticleList(mmtUrl).then((articleList) =>
      setBrowserItems(getBrowserItems(articleList))
    );
  }, [mmtUrl]);

  return (
    <Autocomplete
      size="small"
      id="combo-box-demo"
      filterOptions={filterOptions}
      options={browserItems}
      className={styles['browser_autocomplete']}
      renderInput={(params) => <TextField {...params} label="Open Article" />}
      renderOption={(props, option) => {
        return (
          <Box component="li" {...props}>
            {<OptionDisplay item={option as BrowserItem} />}
          </Box>
        );
      }}
      onChange={(_e, n) => {
        if (!n) return;
        const item = n as BrowserItem;
        router.push(PathToArticle(item));
      }}
    />
  );
}
