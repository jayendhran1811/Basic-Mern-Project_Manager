const axios = require('axios');

const bitbucketService = {
    /**
     * Create a new repository on Bitbucket
     * @param {Object} config - Bitbucket credentials (username, appPassword, workspace, apiToken)
     * @param {Object} repoData - Repository details (name, description, isPrivate)
     */
    createRepository: async (config, repoData) => {
        const { username, appPassword, workspace, apiToken } = config;
        const { name, description, isPrivate = true } = repoData;

        if (!workspace || (!apiToken && (!username || !appPassword))) {
            throw new Error('Bitbucket workspace and authentication (API Token or App Password) are required');
        }

        const repoSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        try {
            let authHeader;
            if (apiToken) {
                authHeader = `Bearer ${apiToken}`;
            } else {
                const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
                authHeader = `Basic ${auth}`;
            }

            const response = await axios.post(
                `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}`,
                {
                    scm: 'git',
                    description: description || '',
                    is_private: isPrivate,
                    fork_policy: 'no_forks'
                },
                {
                    headers: {
                        'Authorization': authHeader,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Project-Manager-App'
                    }
                }
            );

            return {
                success: true,
                data: response.data,
                repoUrl: response.data.links.html.href
            };
        } catch (error) {
            console.error('Bitbucket API Error:', error.response?.data || error.message);
            const message = error.response?.data?.error?.message || error.message;
            throw new Error(`Bitbucket Error: ${message}`);
        }
    },

    /**
     * Test Bitbucket connection
     * @param {Object} config - Bitbucket credentials
     */
    testConnection: async (config) => {
        const { username, appPassword, workspace, apiToken } = config;

        if (!workspace || (!apiToken && (!username || !appPassword))) {
            throw new Error('Bitbucket workspace and authentication (API Token or App Password) are required');
        }

        try {
            let authHeader;
            if (apiToken) {
                authHeader = `Bearer ${apiToken}`;
            } else {
                const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
                authHeader = `Basic ${auth}`;
            }

            const response = await axios.get(
                `https://api.bitbucket.org/2.0/workspaces/${workspace}`,
                {
                    headers: {
                        'Authorization': authHeader,
                        'User-Agent': 'Project-Manager-App'
                    }
                }
            );

            return {
                success: true,
                workspaceName: response.data.name
            };
        } catch (error) {
            console.error('Bitbucket Test Error:', error.response?.data || error.message);
            const message = error.response?.data?.error?.message || error.message;
            throw new Error(`Connection Failed: ${message}`);
        }
    }
};

module.exports = bitbucketService;
