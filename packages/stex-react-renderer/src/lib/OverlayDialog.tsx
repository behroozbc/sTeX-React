import { OpenInNew } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, IconButton } from '@mui/material';
import { getChildrenOfBodyNode } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { ReactNode, useContext, useState } from 'react';
import { ContentFromUrl, TopLevelContext } from './ContentFromUrl';
import { ErrorBoundary } from './ErrorBoundary';
import { getLocaleObject } from './lang/utils';
import { ServerLinksContext } from './stex-react-renderer';

export interface OverlayDialogProps {
  contentUrl: string;
  isMath: boolean;
  displayNode: (topLevelDocUrl: string) => ReactNode;
}

export function OverlayDialog({
  contentUrl,
  displayNode,
  isMath,
}: OverlayDialogProps) {
  const t = getLocaleObject(useRouter());
  const [open, setOpen] = useState(false);
  const { mmtUrl } = useContext(ServerLinksContext);
  const { topLevelDocUrl } = useContext(TopLevelContext);
  const encodedTopLevelDocUrl = encodeURIComponent(topLevelDocUrl);

  const toDisplayNode = displayNode(topLevelDocUrl);
  return (
    <ErrorBoundary hidden={false}>
      {isMath ? (
        /* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */
        <mrow style={{ display: 'inline' }} onClick={() => setOpen(true)}>
          {toDisplayNode}
          {/* @ts-expect-error: 'mrow is MathML which does not exist on JSX.IntrinsicElements(ts2339) */}
        </mrow>
      ) : (
        <span style={{ display: 'inline' }} onClick={() => setOpen(true)}>
          {toDisplayNode}
        </span>
      )}
      <Dialog onClose={() => setOpen(false)} open={open} maxWidth="lg">
        <Box display="flex" flexDirection="column" m="5px" maxWidth="800px">
          <a
            style={{ marginLeft: 'auto' }}
            href={`${mmtUrl}/${contentUrl}&contextUrl=${encodedTopLevelDocUrl}`.replace(
              ':sTeX/declaration',
              ':sTeX/symbol'
            )}
            target="_blank"
            rel="noreferrer"
          >
            <IconButton>
              <OpenInNew />
            </IconButton>
          </a>
          <ContentFromUrl
            topLevelDocUrl={topLevelDocUrl}
            url={`${contentUrl}&contextUrl=${encodedTopLevelDocUrl}`}
            modifyRendered={getChildrenOfBodyNode}
          />

          <DialogActions sx={{ p: '0' }}>
            <Button onClick={() => setOpen(false)}>{t.close}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </ErrorBoundary>
  );
}
