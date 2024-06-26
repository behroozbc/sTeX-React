import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeTxnAndEndSet500OnError,
} from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  // TODO: Check if from updaterACLId
  const id = req.body.id as string;
  if (!id || typeof id !== 'string') return res.status(422).send('Missing id.');

  await executeTxnAndEndSet500OnError(
    res,
    'DELETE FROM AccessControlList WHERE id=?',
    [id],
    'DELETE FROM ACLMembership WHERE parentACLId=?',
    [id]
  );
}
