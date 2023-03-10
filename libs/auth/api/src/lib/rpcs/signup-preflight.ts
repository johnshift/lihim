import { SupabaseClient } from '@supabase/supabase-js';

import {
  ERR_EMAIL_TAKEN,
  ERR_USERNAME_TAKEN,
  SignupPayload,
} from '@lihim/auth/core';
import { supabaseRpc } from '@lihim/shared/api';
import { ApiError } from '@lihim/shared/core';

import { RPC_SIGNUP_PREFLIGHT } from '../constants';

// Supabase RPC generics
type RpcName = typeof RPC_SIGNUP_PREFLIGHT;
type RpcSignature = {
  Args: {
    usernameInput: string;
    emailInput: string;
  };
  Returns: {
    usernameTaken: boolean;
    emailTaken: boolean;
  };
};

export const signupPreflight = async (
  supabase: SupabaseClient,
  payload: SignupPayload,
) => {
  // Exec signup-preflight rpc
  const { data, error } = await supabaseRpc<RpcName, RpcSignature>(
    supabase,
    RPC_SIGNUP_PREFLIGHT,
    {
      usernameInput: payload.username,
      emailInput: payload.email,
    },
  );

  // Throw 500 if error
  if (error) {
    throw new Error('signup-preflight error: ' + error.message);
  }

  // Throw 500 if no data
  if (!data) {
    throw new Error('signup-preflight no data returned');
  }

  if (data.usernameTaken) {
    throw new ApiError(400, ERR_USERNAME_TAKEN);
  }

  if (data.emailTaken) {
    throw new ApiError(400, ERR_EMAIL_TAKEN);
  }
};
