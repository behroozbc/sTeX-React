import { Box, CircularProgress } from '@mui/material';
import {
  SectionsAPIData,
  getAncestors,
  getCoveredSections,
  getDocumentSections,
  lastFileNode,
} from '@stex-react/api';
import {
  BG_COLOR,
  IS_MMT_VIEWER,
  getSectionInfo,
  shouldUseDrawer,
} from '@stex-react/utils';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { ContentDashboard } from './ContentDashboard';
import { LayoutWithFixedMenu } from './LayoutWithFixedMenu';
import { PerSectionQuiz } from './PerSectionQuiz';
import { mmtHTMLToReact } from './mmtParser';
import { ServerLinksContext } from './stex-react-renderer';

function shortenDocSections(
  coveredSectionIds: string[],
  docSections?: SectionsAPIData
) {
  if (!coveredSectionIds.length || !docSections) return docSections;
  const newChildren: SectionsAPIData[] = [];
  for (const child of docSections.children || []) {
    const shortenedChild = shortenDocSections(coveredSectionIds, child);
    if (shortenedChild) newChildren.push(shortenedChild);
  }
  if (
    !newChildren.length &&
    !coveredSectionIds.includes(docSections.id ?? '')
  ) {
    return undefined;
  }
  const shortenedDocSections: SectionsAPIData = { ...docSections };
  shortenedDocSections.children = newChildren;

  return shortenedDocSections;
}

export function DocProblemBrowser({
  contentUrl,
  courseId,
  topOffset = 0,
  noFrills = false,
  startSecNameExcl,
  endSecNameIncl,
}: {
  contentUrl: string;
  courseId?: string;
  startSecNameExcl?: string;
  endSecNameIncl?: string;
  topOffset?: number;
  noFrills?: boolean;
}) {
  const [showDashboard, setShowDashboard] = useState(
    !shouldUseDrawer() && !IS_MMT_VIEWER
  );
  const [docSections, setDocSections] = useState<SectionsAPIData | undefined>(
    undefined
  );
  const { mmtUrl } = useContext(ServerLinksContext);
  const [selectedSection, setSelectedSection] = useState('');
  const ancestors = getAncestors(
    undefined,
    undefined,
    selectedSection,
    docSections
  );
  const [problemCounts, setProblemCounts] = useState<{ [id: string]: number }>(
    {}
  );

  const sectionParentInfo = lastFileNode(ancestors);
  const coveredSectionIds =
    startSecNameExcl && endSecNameIncl
      ? getCoveredSections(startSecNameExcl, endSecNameIncl, docSections)
          .coveredSectionIds
      : [];

  const shortenedDocSections = shortenDocSections(
    coveredSectionIds,
    docSections
  );

  useEffect(() => {
    const { archive, filepath } = getSectionInfo(contentUrl);
    getDocumentSections(mmtUrl, archive, filepath).then(setDocSections);
  }, [mmtUrl, contentUrl]);

  useEffect(() => {
    if (!courseId) return;
    axios.get(`/api/get-course-problem-counts/${courseId}`).then((resp) => {
      console.log(resp.data);
      setProblemCounts(resp.data);
    });
  }, [courseId]);

  if (!docSections) return <CircularProgress />;

  return (
    <LayoutWithFixedMenu
      menu={
        <ContentDashboard
          coveredSectionIds={coveredSectionIds}
          courseId={courseId}
          docSections={shortenedDocSections}
          onClose={() => setShowDashboard(false)}
          contentUrl={contentUrl}
          preAdornment={(sectionId) => {
            const numProblems = problemCounts[sectionId];
            if (numProblems === undefined) return <></>;
            return <i>({problemCounts[sectionId] || 'None'})&nbsp;</i>;
          }}
          selectedSection={selectedSection}
          onSectionClick={(section) => setSelectedSection(section)}
        />
      }
      topOffset={topOffset}
      showDashboard={showDashboard}
      setShowDashboard={setShowDashboard}
      noFrills={noFrills}
    >
      <Box px="10px" bgcolor={BG_COLOR}>
        {ancestors?.length && (
          <h3>
            <span style={{ color: 'gray' }}>Problems for</span>{' '}
            {mmtHTMLToReact(ancestors[ancestors.length - 1].title ?? '')}
          </h3>
        )}
        {!selectedSection && (
          <>
            <br />
            <i>
              Click on a section in the TOC to see problems associated with it.
            </i>
          </>
        )}
        {sectionParentInfo?.archive && sectionParentInfo?.filepath && (
          <PerSectionQuiz
            archive={sectionParentInfo.archive}
            filepath={sectionParentInfo.filepath}
            showButtonFirst={false}
          />
        )}
        <br />
        <b style={{ color: 'red' }}>
          Note: These problems are only to aid your learning. They do not cover
          the course material exhaustively and there are no guarantees that the
          problems are correct or that they are representative of kinds of
          problems that will be on the quizzes or the exam.
        </b>
      </Box>
    </LayoutWithFixedMenu>
  );
}
