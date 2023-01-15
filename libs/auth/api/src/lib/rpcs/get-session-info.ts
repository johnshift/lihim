import { LoggedInSession } from '@lihim/auth/core';
import { createSupabaseClient, supabaseRpc } from '@lihim/shared/api';

import { RPC_GET_SESSION_INFO } from '../constants';

type RpcName = typeof RPC_GET_SESSION_INFO;
type RpcSignature = {
  Args: {
    emailInput: string;
  };
  Returns: Omit<LoggedInSession, 'isAnon'>;
};

export const getSessionInfo = async (email: string) => {
  // Supabase anon client
  const supabase = createSupabaseClient();

  // Execute get-session-info rpc
  const { data, error } = await supabaseRpc<RpcName, RpcSignature>(
    supabase,
    RPC_GET_SESSION_INFO,
    {
      emailInput: email,
    },
  );

  // Throw 500 if error
  if (error) {
    console.error('get-session-info error (500): error =', error.message);
    throw new Error(error.message);
  }

  // Throw 500 if no data
  if (!data) {
    console.error('get-session-info no data returned (500): data =', data);
    throw new Error('No data returned');
  }

  return data;
};
