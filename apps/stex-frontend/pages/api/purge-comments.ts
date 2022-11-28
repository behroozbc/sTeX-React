import { MODERATORS } from '@stex-react/api';
import {
  checkIfPostOrSetError,
  executeTransactionSet500OnError,
  getUserIdOrSetError,
} from './comment-utils';

export default async function handler(req, res) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  if (MODERATORS.includes(userId)) {
    res
      .status(400)
      .send("Moderators data can't be purged. Contact admin for help.");
    return;
  }

  const commentUpdate = await executeTransactionSet500OnError(
    `UPDATE comments
    SET statement=NULL, userId=NULL, userName=NULL, userEmail=NULL, selectedText=NULL, isDeleted=1
    WHERE userId=?`,
    [userId],
    // This is okay for now because people can update only their own comments. Moderators should not be purged.
    `DELETE FROM updateHistory WHERE updaterId=?`,
    [userId],
    res
  );
  if (!commentUpdate) return;
  res.status(204).end();
}