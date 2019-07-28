export const keys = {
    wca: {
        prod: {
            login_redirect_uri: "websitedomain/api/v0/auth/wca/callback",
            user_agent: "websitedomain",
            scope: "public",
            client_id: "client id",
            client_secret: "client secret",
            wca_website: "https://www.worldcubeassociation.org"
        },
        dev: {
            login_redirect_uri: "http://localhost:4200/api/v0/auth/wca/callback",
            user_agent: "http://localhost:4200",
            scope: "public",
            client_id: "client id",
            client_secret: "client secret",
            wca_website: "https://staging.worldcubeassociation.org"
        }
    },
    session: {
        secret: 'secret',
        cookie: {
            secure: false,
            maxAge: 1000 * 3600 * 24 * 7
        }
    },
}
