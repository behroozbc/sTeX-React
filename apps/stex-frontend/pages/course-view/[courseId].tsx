import MergeIcon from '@mui/icons-material/Merge';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
} from '@mui/material';
import { ContentWithHighlight } from '@stex-react/stex-react-renderer';
import { localStore } from '@stex-react/utils';
import { SlideDeckNavigation } from '../../components/SlideDeckNavigation';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SlideDeck } from '../../components/SlideDeck';
import { VideoDisplay } from '../../components/VideoDisplay';
import MainLayout from '../../layouts/MainLayout';
import { CourseInfo, DeckAndVideoInfo, Slide } from '../../shared/slides';
import styles from './course-view.module.scss';

const W = typeof window === 'undefined' ? undefined : window;

function RenderElements({ elements }: { elements: string[] }) {
  return (
    <>
      {elements.map((e, idx) => (
        <ContentWithHighlight key={idx} mmtHtml={e} />
      ))}
    </>
  );
}

enum ViewMode {
  SLIDE_MODE = 'SLIDE_MODE',
  VIDEO_MODE = 'VIDEO_MODE',
  COMBINED_MODE = 'COMBINED_MODE',
}
function ToggleModeButton({
  viewMode,
  updateViewMode,
}: {
  viewMode: ViewMode;
  updateViewMode: (mode: ViewMode) => void;
}) {
  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={(event, newVal) => {
        if (newVal !== null) updateViewMode(newVal);
      }}
      sx={{ m: '5px 0', border: '1px solid black' }}
    >
      <Tooltip title="Show video">
        <ToggleButton value={ViewMode.VIDEO_MODE}>
          <VideoCameraFrontIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Show slides">
        <ToggleButton value={ViewMode.SLIDE_MODE}>
          <SlideshowIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Show slides and video">
        <ToggleButton value={ViewMode.COMBINED_MODE}>
          <MergeIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}

const CourseViewPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;

  const [selectedDeckId, setSelectedDeckId] = useState('initial');
  const [preNotes, setPreNotes] = useState([] as string[]);
  const [postNotes, setPostNotes] = useState([] as string[]);
  const [offset, setOffset] = useState(64);
  const [courseInfo, setCourseInfo] = useState(undefined as CourseInfo);
  const [deckInfo, setDeckInfo] = useState(undefined as DeckAndVideoInfo);
  const [viewMode, setViewMode] = useState(ViewMode.SLIDE_MODE);
  useEffect(
    () =>
      setViewMode(
        ViewMode[localStore?.getItem('defaultMode') as keyof typeof ViewMode] ||
          ViewMode.SLIDE_MODE
      ),
    []
  );

  useEffect(() => {
    if (!router.isReady) return;
    axios.get(`/api/get-course-info/${courseId}`).then((r) => {
      setCourseInfo(r.data);
    });
  }, [router.isReady, courseId]);

  useEffect(() => {
    for (const section of courseInfo?.sections || []) {
      for (const deck of section.decks) {
        if (deck.deckId === selectedDeckId) {
          setDeckInfo(deck);
          return;
        }
      }
    }
    setDeckInfo(undefined);
  }, [courseInfo, selectedDeckId]);

  useEffect(() => {
    const onScroll = () => setOffset(Math.max(64 - (W?.pageYOffset || 0), 0));
    // clean up code
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <MainLayout>
      <Box display="flex">
        <Box flexBasis="600px" flexGrow={1} overflow="hidden">
          <Box maxWidth="800px" margin="auto">
            <ToggleModeButton
              viewMode={viewMode}
              updateViewMode={(mode) => {
                setViewMode(mode);
                localStore?.setItem('defaultMode', ViewMode[mode]);
              }}
            />
            {(viewMode === ViewMode.VIDEO_MODE ||
              viewMode === ViewMode.COMBINED_MODE) && (
              <VideoDisplay deckInfo={deckInfo} />
            )}
            {(viewMode === ViewMode.SLIDE_MODE ||
              viewMode === ViewMode.COMBINED_MODE) && (
              <SlideDeck
                courseId={courseId}
                navOnTop={viewMode === ViewMode.COMBINED_MODE}
                deckInfo={deckInfo}
                onSlideChange={(slide: Slide) => {
                  setPreNotes(slide?.preNotes || []);
                  setPostNotes(slide?.postNotes || []);
                }}
              />
            )}
            <hr />

            {viewMode !== ViewMode.VIDEO_MODE && (
              <Box p="5px">
                <RenderElements elements={preNotes} />
                {preNotes.length > 0 && postNotes.length > 0 && <hr />}
                <RenderElements elements={postNotes} />
              </Box>
            )}
          </Box>
        </Box>
        <Box flexBasis="200px" maxWidth="300px" flexGrow={1} overflow="auto">
          <Box className={styles['dash_outer_box']}>
            <Box className={styles['dash_inner_box']} mt={`${offset}px`}>
              <Toolbar
                variant="dense"
                sx={{
                  borderLeft: '2px solid #777',
                  fontFamily: 'Open Sans,Verdana,sans-serif',
                }}
              >
                Course Content
              </Toolbar>
              <Box
                className={styles['dash_scroll_area_box']}
                sx={{ border: '2px solid #777' }}
              >
                <SlideDeckNavigation
                  sections={courseInfo?.sections || []}
                  selected={selectedDeckId}
                  onSelect={(i) => {
                    setSelectedDeckId(i);
                    setPreNotes([]);
                    setPostNotes([]);
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CourseViewPage;