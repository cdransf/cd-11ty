export default {
  async scheduled(event, env, ctx) {
    const deployHookUrl = env.DEPLOY_HOOK_URL;

    const response = await fetch(deployHookUrl, {
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error triggering deploy: ${response.statusText}`,
        errorText
      );
      return;
    }

    console.log("Deploy triggered successfully");
  },
};
