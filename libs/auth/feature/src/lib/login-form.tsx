import { SubmitHandler, useForm } from 'react-hook-form';

import { LoginPayload } from '@lihim/auth/core';
import { useLoginMutation } from '@lihim/auth/data-access';
import { LoginForm as LoginFormUi } from '@lihim/auth/ui';
import { ERR_INTERNAL } from '@lihim/shared/core';
import { useRootContext } from '@lihim/shared/data-access';

const LoginForm = () => {
  // Auth modal state
  const { authModalActions } = useRootContext();

  // Login mutation
  const { mutate, error, isLoading } = useLoginMutation(authModalActions.close);

  // Form controls
  // Note: we let backend validate login to reduce hints on credentials
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginPayload>({
    mode: 'onSubmit',
  });

  // Only show red borders on api + validation errors
  const hasError = (error && error.message !== ERR_INTERNAL) || !isValid;

  // Submit
  const submit: SubmitHandler<LoginPayload> = (data) => {
    mutate(data);
  };

  return (
    <LoginFormUi
      isLoading={isLoading}
      hasError={hasError}
      showSignup={authModalActions.openSignup}
      control={control}
      onSubmit={handleSubmit(submit)}
    />
  );
};

export default LoginForm;
