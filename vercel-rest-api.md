# Using the REST API

> Interact programmatically with your Vercel account using the SDK or direct HTTP requests.

<Note>To view all endpoints, and explore code examples with the SDK and direct API calls, see the [reference endpoints documentation](/endpoints).</Note>

You can deploy new versions of web applications, manage custom domains, retrieve information about deployments, and manage secrets and environment variables for projects.

The API supports any programming language or framework that can send HTTP requests.

To interact with the API, you can:

* [Use the Vercel SDK](/sdk) by first instantiating with your token
* Use the language of your choice by calling the endpoints directly and [providing your token](#authentication)

## API Basics

Our API is exposed as an HTTP/1 and HTTP/2 service over SSL. All endpoints live under the URL `https://api.vercel.com` and then generally follow the REST architecture.

### Server Specs

#### HTTP and TLS

The API supports HTTP versions 1, 1.1, and 2, although HTTP/2 is preferred.

TLS versions 1.2 and 1.3 are supported, with resumption.

For more information on TLS support, refer to the SSL Labs report.

### Content Type

All requests must be encoded as JSON with the Content-Type: application/json header. If not otherwise specified, responses from the Vercel API, including errors, are encoded exclusively as JSON as well.

### Authentication

Vercel Access Tokens are required to authenticate and use the Vercel API.

```js  theme={"system"}
  Authorization: Bearer <TOKEN>
```

#### Creating an Access Token

Access Tokens can be created and managed from inside your [account settings](https://vercel.com/account/tokens).

1. In the upper-right corner of your [dashboard](https://vercel.com/dashboard), click your profile picture, then select **Account Settings** or go to the [Tokens page directly](https://vercel.com/account/settings/tokens)
2. Select **Tokens** from the sidebar
3. From **Create Token** section, enter a descriptive name for the token
4. Choose the scope from the list of Teams in the drop-down menu. The scope ensures that only your specified Team(s) can use an Access Token
5. From the drop-down, select an expiration date for the Token
6. Click **Create Token**
7. Once you've created an Access Token, securely store the value as it will not be shown again.

#### Expiration

Setting an expiration date on an Access Token is highly recommended and is considered one of the standard security practices that helps keep your information secure. You can select from a default list of expiration dates ranging from 1 day to 1 year. You can view the expiration date of your Access Tokens on the [tokens page.](https://vercel.com/account/tokens)

#### Accessing Resources Owned by a Team

By default, you can access resources contained within your own user account (personal).

To access resources owned by a team, or create a project for a *specific* team, you must first find the [Team ID](https://vercel.com/docs/teams-and-accounts/create-or-join-a-team#find-your-team-id).

After you obtained the Team ID, append it as a query string at the end of the API endpoint URL:

```js  theme={"system"}
https://api.vercel.com/v6/deployments?teamId=[teamID]
```

#### Failed Authentication

If authentication is unsuccessful for a request, the [error status code](#errors) **403** is returned.

## Types

The following is a list of the types of data used within the Vercel API:

| Name        | Definition                                                             | Example                      |
| ----------- | ---------------------------------------------------------------------- | ---------------------------- |
| **ID**      | A unique value used to identify resources.                             | `"V0fra8eEgQwEpFhYG2vTzC3K"` |
| **String**  | A string is a sequence of characters used to represent text.           | `"value"`                    |
| **Integer** | An integer is a number without decimals.                               | `1234`                       |
| **Float**   | A float is a number with decimals.                                     | `12.34`                      |
| **Map**     | A data structure with a list of values assigned to a unique key.       | `{ "key": "value" }`         |
| **List**    | A data structure with only a list of values separated by a comma.      | `["value", 1234, 12.34]`     |
| **Enum**    | An Enum is a String with only a few possible valid values.             | `A` or `B`                   |
| **Date**    | An Integer representing a date in milliseconds since the UNIX epoch.   | `1540095775941`              |
| **IsoDate** | A String representing a date in the 8601 format.                       | `YYYY-MM-DDTHH:mm:ssZ`       |
| **Boolean** | A Boolean is a type of two possible values representing true or false. | `true`                       |

## Pagination

When the API response includes an array of records, a pagination object is returned when the total number of records present is greater than the limit per request. The default value of this limit is 20 but it can be changed by passing a value to the query parameter `limit` when the request is made. The maximum possible value of `limit` is 100.

You can then use the pagination object to make additional requests and obtain all the records.

The pagination object is structured as shown in the example below:

```json pagination-structure theme={"system"}
{
  "pagination": {
    "count": 20, //Amount of items in the current page.
    "next": 1555072968396, //Timestamp that must be used to request the next page.
    "prev": 1555413045188 //Timestamp that must be used to request the previous page.
  }
}
```

In order to obtain the records for the next batch, perform the following actions:

1. Send a request to the same API endpoint
2. Include the query parameter `until` with a value equal to the timestamp value of `next` returned in the previous request
3. Repeat this sequence until the pagination object has a `next` value of `null`

This is an example of applying this sequence with `Node.js` to save all the projects in your personal account to a `json` file:

```js pagination-example.js theme={"system"}
const axios = require('axios');
const fs = require('fs');
const vercelToken = 'yourtokenvalue'; //Replace with your token
const apiEndPt = 'https://api.vercel.com/v9/projects';

let config = {
  method: 'get',
  url: apiEndPt,
  headers: {
    Authorization: 'Bearer ' + vercelToken,
  },
};
let results = [];

(function loop() {
  axios(config)
    .then(function (response) {
      results.push(...response.data.projects);
      if (response.data.pagination.next !== null) {
        config.url = `${apiEndPt}?until=${response.data.pagination.next}`;
        loop();
      } else {
        //you can use the final results object and for example save it to a json file
        fs.writeFileSync('projects.json', JSON.stringify(results));
      }
    })
    .catch(function (error) {
      console.log(error);
    });
})();
```

## Rate Limits

We limit the number of calls you can make over a certain period of time.
Rate limits vary and are specified by the following header in all responses:

| Header                  | Description                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| `X-RateLimit-Limit`     | The maximum number of requests that the consumer is permitted to make.       |
| `X-RateLimit-Remaining` | The number of requests remaining in the current rate limit window.           |
| `X-RateLimit-Reset`     | The time at which the current rate limit window resets in UTC epoch seconds. |

When the rate limit is **exceeded**, an error is returned with the status "**429 Too Many Requests**":

```json error-response theme={"system"}
{
  "error": {
    "code": "too_many_requests",
    "message": "Rate limit exceeded"
  }
}
```

<Note>
  You can find the complete list of rate limits in the [limits
  documentation](https://vercel.com/docs/limits#rate-limits).
</Note>

## Versioning

All endpoints and examples are designated with a specific version. Versions vary per endpoint and are not global.

The response shape of a certain endpoint is not guaranteed to be fixed over time. In particular, we might add new keys to responses without bumping a version endpoint, which will be noted in the changelog.

To ensure the security and correctness of your application, make sure to only read the keys from the response that your application needs. Don't proxy entire responses to third-parties without validation.

Old versions of each endpoint are supported for as long as possible. When we intend to deprecate, we will notify users in the changelog section.

Endpoint versions follow the base URL and come before the endpoint. For example:

```js version-endpoint theme={"system"}
https://api.vercel.com/v6/deployments`
```

This examples uses version `6` of the [deployments
endpoint](/endpoints/deployments/get-deployment-events).


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://vercel.mintlify.app/docs/rest-api/reference/llms.txt