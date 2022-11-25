import { getUserName } from '@stex-react/api';
import { useEffect, useState } from 'react';
import { EditView } from './EditView';
import TextsmsIcon from '@mui/icons-material/Textsms';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

import styles from './comments.module.scss';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { SelectedInfo } from './selected-info';

interface CommentReplyProps {
  archive: string;
  filepath: string;
  isPrivateNote: boolean;
  parentId?: number;
  placeholder?: string;
  selectedText?: string;
  selectedElement?: any;
  hidden?: boolean;
  onCancel?: () => void;
  onUpdate: () => void;
}

export function CommentReply({
  archive,
  filepath,
  isPrivateNote,
  parentId = 0,
  placeholder = '',
  selectedText = undefined,
  selectedElement = undefined,
  hidden = false,
  onCancel,
  onUpdate,
}: CommentReplyProps) {
  const [name, setName] = useState<string | undefined>(undefined);

  useEffect(() => {
    getUserName().then(setName);
  }, []);

  const [postAnonymously, setPostAnonymously] = useState(false);

  const commentHeader = !isPrivateNote ? (
    <>
      <span className={styles['user_link']} style={{ marginRight: '20px' }}>
        {postAnonymously ? <i>Anonymous</i> : name}
      </span>
      <FormControlLabel
        control={
          <Checkbox
            sx={{ p: 0 }}
            checked={postAnonymously}
            onChange={(e) => setPostAnonymously(e.target.checked)}
          />
        }
        label="Hide Identity"
      />
    </>
  ) : null;

  return (
    <Box
      hidden={hidden}
      display={hidden ? 'none' : 'flex'}
      alignItems="stretch"
    >
      {isPrivateNote ? (
        <TextSnippetIcon fontSize="large" color="secondary" />
      ) : (
        <TextsmsIcon fontSize="large" color="secondary" />
      )}
      <div className={styles['stretchy_div']}>
        {commentHeader}
        <SelectedInfo text={selectedText} />
        <EditView
          parentId={parentId}
          archive={archive}
          filepath={filepath}
          isPrivateNote={isPrivateNote}
          postAnonymously={postAnonymously}
          selectedText={selectedText}
          placeholder={placeholder}
          onCancel={onCancel}
          onUpdate={onUpdate}
        />
      </div>
    </Box>
  );
}
