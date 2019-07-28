import passport from 'passport';
import { Strategy as WCAStrategy } from 'passport-wca';
import { config } from '../secrets/config';
import { Deserialize } from 'cerialize';
import { getCustomRepository } from 'typeorm';
import { UserModel } from "../model/user";
import { UserRepository } from "../database/repos/user.repository";
import { UserEntity } from "../database/entities/user.entity";

export function authMiddleWare(req, res, next) {
    if (process.env.NODE_ENV === "production") {
        passport.use(new WCAStrategy({
            clientID: config.wca.prod.client_id,
            clientSecret: config.wca.prod.client_secret,
            callbackURL: config.wca.prod.login_redirect_uri,
            scope: config.wca.prod.scope,
            userAgent: config.wca.prod.user_agent
        }, loginCallback));
    } else {
        passport.use(new WCAStrategy({
            clientID: config.wca.dev.client_id,
            clientSecret: config.wca.dev.client_secret,
            callbackURL: config.wca.dev.login_redirect_uri,
            scope: config.wca.dev.scope,
            userAgent: config.wca.dev.user_agent,
            authorizationURL: 'https://staging.worldcubeassociation.org/oauth/authorize',
            tokenURL: 'https://staging.worldcubeassociation.org/oauth/token',
            userProfileURL: 'https://staging.worldcubeassociation.org/api/v0/me'
        }, loginCallback));
    }
    next();
}

async function loginCallback(accessToken, refreshToken, profile, done) {
    const user: UserModel = Deserialize(profile._json.me, UserModel);
    const repo: UserRepository = getCustomRepository(UserRepository);
    let entity: UserEntity = await repo.saveUser(user);
    done(null, entity._transform());
}

passport.serializeUser((user: UserModel, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    const userRepo: UserRepository = getCustomRepository(UserRepository);
    let dbUser: UserEntity = await  userRepo.getUserById(id);
    done(null, dbUser._transform());
});