const axios = require('axios');

const githubService = {
    /**
     * Create a new repository on GitHub
     * @param {Object} config - GitHub credentials (personalAccessToken, username, organization)
     * @param {Object} repoData - Repository details (name, description, isPrivate)
     */
    createRepository: async (config, repoData) => {
        const { personalAccessToken, username, organization } = config;
        const { name, description, isPrivate = true } = repoData;

        if (!personalAccessToken || (!username && !organization)) {
            throw new Error('GitHub Personal Access Token and (Username or Organization) are required');
        }

        // GitHub API endpoint - different for user vs org
        const baseUrl = organization
            ? `https://api.github.com/orgs/${organization}/repos`
            : `https://api.github.com/user/repos`;

        try {
            const response = await axios.post(
                baseUrl,
                {
                    name,
                    description: description || '',
                    private: isPrivate,
                    auto_init: true // Create an initial commit with a README
                },
                {
                    headers: {
                        'Authorization': `Bearer ${personalAccessToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                        'User-Agent': 'Project-Manager-App'
                    }
                }
            );

            return {
                success: true,
                data: response.data,
                repoUrl: response.data.html_url
            };
        } catch (error) {
            console.error('GitHub API Error:', error.response?.data || error.message);
            const message = error.response?.data?.message || error.message;
            throw new Error(`GitHub Error: ${message}`);
        }
    },

    /**
     * Test GitHub connection
     * @param {Object} config - GitHub credentials
     */
    testConnection: async (config) => {
        const { personalAccessToken, username, organization } = config;

        if (!personalAccessToken) {
            throw new Error('GitHub Personal Access Token is required');
        }

        try {
            // Test by fetching the authenticated user's info
            const response = await axios.get('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${personalAccessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Project-Manager-App'
                }
            });

            let info = `Connected as ${response.data.login}`;

            if (organization) {
                // Verify org access
                try {
                    await axios.get(`https://api.github.com/orgs/${organization}`, {
                        headers: {
                            'Authorization': `Bearer ${personalAccessToken}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'Project-Manager-App'
                        }
                    });
                    info += ` with access to org ${organization}`;
                } catch (orgErr) {
                    throw new Error(`Unauthorized or organization ${organization} not found`);
                }
            }

            return {
                success: true,
                info
            };
        } catch (error) {
            console.error('GitHub Test Error:', error.response?.data || error.message);
            const message = error.response?.data?.message || error.message;
            throw new Error(`Connection Failed: ${message}`);
        }
    }
};

module.exports = githubService;
