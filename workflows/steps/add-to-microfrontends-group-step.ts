export async function addToMicrofrontendsGroupStep({
  projectName,
  microfrontendsGroupId,
}: {
  projectName: string;
  microfrontendsGroupId: string;
}): Promise<{ success: boolean; addedToGroup: boolean }> {
  'use step';

  const apiKey = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!apiKey) {
    throw new Error('VERCEL_TOKEN is not configured');
  }

  if (!teamId) {
    throw new Error('VERCEL_TEAM_ID is not configured');
  }

  try {
    // First, get the project ID by name
    const projectsUrl = `https://api.vercel.com/v9/projects/${projectName}?teamId=${teamId}`;

    const projectResponse = await fetch(projectsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!projectResponse.ok) {
      const errorText = await projectResponse.text();
      throw new Error(`Failed to get project: ${projectResponse.status} - ${errorText}`);
    }

    const projectData = await projectResponse.json();
    const projectId = projectData.id;

    console.log(`Found project ID: ${projectId} for project: ${projectName}`);

    // Add the project to the microfrontends group
    const addToGroupUrl = `https://api.vercel.com/v1/microfrontend-groups/${microfrontendsGroupId}/memberships?teamId=${teamId}`;

    const addResponse = await fetch(addToGroupUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: projectId,
      }),
    });

    if (!addResponse.ok) {
      const errorText = await addResponse.text();

      // If already in group, that's fine
      if (addResponse.status === 409 || errorText.includes('already')) {
        console.log(`Project ${projectName} is already in the microfrontends group`);
        return {
          success: true,
          addedToGroup: false, // Was already in group
        };
      }

      throw new Error(`Failed to add to microfrontends group: ${addResponse.status} - ${errorText}`);
    }

    const addData = await addResponse.json();
    console.log('Successfully added project to microfrontends group:', addData);

    return {
      success: true,
      addedToGroup: true,
    };
  } catch (error) {
    console.error('Failed to add project to microfrontends group:', error);
    throw new Error(
      `Failed to add to microfrontends group: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
