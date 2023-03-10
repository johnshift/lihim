import {
  ERR_INVALID_REQUEST,
  ERR_INVALID_RESPONSE,
  GenericResponse,
  GenericResponseSchema,
  Undefined,
} from '@lihim/shared/core';
import { UndefinedSchema } from '@lihim/shared/core';
import { parseObject } from '@lihim/shared/utils';

import { FetchError } from './constants';
import { getParsedError } from './get-parsed-error';
import { getUrlBody } from './get-url-body';
import type { ApiFetchOptions, FetchFn } from './types';

const invalidRequestError = new FetchError({
  message: ERR_INVALID_REQUEST,
});
const invalidResponseError = new FetchError({
  message: ERR_INVALID_RESPONSE,
});

export const apiFetch =
  <R, E = GenericResponse, P = Undefined>(
    reqUrl: string,
    options: ApiFetchOptions<R, E, P>,
  ): FetchFn<R, P> =>
  async (_payload?: P) => {
    const {
      method,
      responseSchema,
      payloadSchema = UndefinedSchema,
      errorSchema = GenericResponseSchema,
    } = {
      ...options,
    };

    try {
      const payload = parseObject(_payload, invalidRequestError, payloadSchema);

      const { url, body } = getUrlBody(reqUrl, method, payload);

      const res = await fetch(url, {
        method,
        body,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
      const jsonBody = await res.json();

      if (!res.ok) {
        throw new FetchError(jsonBody);
      }

      return parseObject(jsonBody, invalidResponseError, responseSchema);
    } catch (error) {
      const parsedError = getParsedError<E | GenericResponse>(
        error,
        errorSchema,
      );
      throw parsedError;
    }
  };
