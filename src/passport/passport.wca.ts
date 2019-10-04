import { Deserialize } from "cerialize";
import passport from "passport";
import { Strategy as WCAStrategy } from "passport-wca";
import { getCustomRepository } from "typeorm";
import { UserEntity } from "../database/entities/user.entity";
import { RepoManager } from "../database/repo-manager";
import { UserRepository } from "../database/repos/user.repository";
import { UserModel } from "../model/user";
import { config } from "../secrets/config";

export function authMiddleWare(req, res, next) {
    if (process.env.NODE_ENV === "production") {
        passport.use(new WCAStrategy({
            callbackURL: config.wca.prod.login_redirect_uri,
            clientID: config.wca.prod.client_id,
            clientSecret: config.wca.prod.client_secret,
            scope: config.wca.prod.scope,
            userAgent: config.wca.prod.user_agent
        }, loginCallback));
    } else {
        passport.use(new WCAStrategy({
            authorizationURL: "https://staging.worldcubeassociation.org/oauth/authorize",
            callbackURL: config.wca.dev.login_redirect_uri,
            clientID: config.wca.dev.client_id,
            clientSecret: config.wca.dev.client_secret,
            scope: config.wca.dev.scope,
            tokenURL: "https://staging.worldcubeassociation.org/oauth/token",
            userAgent: config.wca.dev.user_agent,
            userProfileURL: "https://staging.worldcubeassociation.org/api/v0/me"
        }, loginCallback));
    }
    next();
}

async function loginCallback(accessToken, refreshToken, profile, done) {
    let user: UserModel = Deserialize(profile._json.me, UserModel);
    const repo: UserRepository = RepoManager.getUserRepo();
    user = await repo.saveUser(user);
    done(null, user);
}

passport.serializeUser((user: UserModel, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    const repo: UserRepository = RepoManager.getUserRepo();
    const user: UserModel = await repo.getUserById(id);
    done(null, user);
});
