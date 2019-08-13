export const config = {
    wca: {
        competition_id: "ItalianChampionship2019",
        dev: {
            login_redirect_uri: "http://localhost:4200/api/auth/login/callback",
            user_agent: "http://localhost:4200",
            scope: "public email",
            client_id: "",
            client_secret: "",
            wca_website: "https://staging.worldcubeassociation.org"
        },
        prod: {
            login_redirect_uri: "websitedomain/api/v0/auth/wca/callback",
            user_agent: "websitedomain",
            scope: "public",
            client_id: "client id",
            client_secret: "client secret",
            wca_website: "https://www.worldcubeassociation.org"
        },
    },
    session: {
        secret: "secret",
        cookie: {
            secure: false,
            maxAge: 1000 * 3600 * 24 * 7
        }
    },
    game: {
        country: "Italy",
        creation_closes: "",
        competitors_per_team: 6,
        best_n_placements_to_consider: 3,
        default_price: 10,
        at_points: 24,
        points: {
            "1": 300,
            "2": 276,
            "3": 253,
            "4": 231,
            "5": 210,
            "6": 190,
            "7": 171,
            "8": 153,
            "9": 136,
            "10": 120,
            "11": 105,
            "12": 91,
            "13": 78,
            "14": 66,
            "15": 55,
            "16": 45,
            "17": 33,
            "18": 28,
            "19": 21,
            "20": 15,
            "21": 10,
            "22": 6,
            "23": 3,
            "24": 1
        }
    },
    cubecomps: {
        competition_id: 4360,
    }
}
