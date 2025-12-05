export async function verifyMicrofrontendGroupMembershipStep({
  projectName,
  microfrontendsGroupId,
  maxAttempts = 10,
  delayMs = 2000,
}: {
  projectName: string;
  microfrontendsGroupId: string;
  maxAttempts?: number;
  delayMs?: number;
}): Promise<{ verified: boolean; attempts: number }> {
  'use step';

  const apiKey = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!apiKey) {
    throw new Error('VERCEL_TOKEN is not configured');
  }

  if (!teamId) {
    throw new Error('VERCEL_TEAM_ID is not configured');
  }

  console.log(`Verifying project ${projectName} is in microfrontends group ${microfrontendsGroupId}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Get all members of the microfrontends group
      const membersUrl = `https://api.vercel.com/v1/microfrontend-groups/${microfrontendsGroupId}/memberships?teamId=${teamId}`;

      const response = await fetch(membersUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch group members (attempt ${attempt}/${maxAttempts}):`, errorText);

        if (attempt < maxAttempts) {
          console.log(`Waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }

        throw new Error(`Failed to fetch group members: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Check if our project is in the memberships list
      // The API returns an array of membership objects with project information
      const memberships = data.memberships || [];

      // Look for our project by name
      const isMember = memberships.some((membership: any) => {
        return membership.project?.name === projectName;
      });

      if (isMember) {
        console.log(`✓ Project ${projectName} confirmed in microfrontends group after ${attempt} attempt(s)`);
        return {
          verified: true,
          attempts: attempt,
        };
      }

      console.log(`Project ${projectName} not yet in group (attempt ${attempt}/${maxAttempts})`);

      if (attempt < maxAttempts) {
        console.log(`Waiting ${delayMs}ms before checking again...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error checking group membership (attempt ${attempt}/${maxAttempts}):`, error);

      if (attempt < maxAttempts) {
        console.log(`Waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }

  // If we get here, we exhausted all attempts without finding the project
  throw new Error(
    `Project ${projectName} not found in microfrontends group ${microfrontendsGroupId} after ${maxAttempts} attempts. ` +
    `This may indicate the project was not successfully added to the group.`
  );
}
