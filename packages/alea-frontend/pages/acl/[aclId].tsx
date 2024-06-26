import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { AccessControlList, getAcl } from '@stex-react/api';
import axios from 'axios';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const AclId: NextPage = () => {
  const { query } = useRouter();

  const [acls, setAcls] = useState<string[]>([]);
  const [allMemberUserIds, setAllMemberUserIds] = useState<string[]>([]);
  const [desc, setDesc] = useState<string>(null);

  async function getMembers() {
    try {
      const acl = await getAcl(query.aclId as string);
      setDesc(acl?.description);
      const aclIds = new Set<string>();
      const userMembers = new Set<string>();

      acl.memberACLIds.forEach((m) => aclIds.add(m));
      acl.memberUserIds.forEach((m) => userMembers.add(m));
      setAllMemberUserIds(Array.from(userMembers));
      setAcls(Array.from(aclIds));
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (query.aclId) {
      getMembers();
    }
  }, [query.aclId]);

  return (
    <MainLayout>
      <Box
        sx={{
          m: '0 auto',
          maxWidth: '800px',
          p: '10px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            padding: '16px',
            margin: '16px 0',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <Typography variant="h4" color="primary" gutterBottom>
            {query.aclId}
          </Typography>
          {desc && (
            <Typography variant="subtitle1" color="textSecondary">
              Description: {desc}
            </Typography>
          )}

          {acls.length !== 0 && (
            <Box sx={{ marginTop: '32px' }}>
              <Typography variant="h6" color="secondary">
                Member ACLs
              </Typography>
              <List>
                {acls.map((aclId, index) => (
                  <React.Fragment key={aclId}>
                    <ListItem
                      button
                      component="a"
                      href={`/acl/${aclId}`}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <ListItemText primary={aclId} />
                    </ListItem>
                    {index < acls.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {allMemberUserIds.length !== 0 && (
            <Box sx={{ marginTop: '32px' }}>
              <Typography variant="h6" color="secondary">
                Direct Members
              </Typography>
              <List>
                {allMemberUserIds.map((user, index) => (
                  <React.Fragment key={user}>
                    <ListItem
                      button
                      component="a"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <ListItemText primary={user} />
                    </ListItem>
                    {index < allMemberUserIds.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AclId;
