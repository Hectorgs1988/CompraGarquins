import session from "express-session";
import connectSessionKnex from "connect-session-knex";
import { db } from "../db/knex.js";
import { env } from "../config/env.js";

const { ConnectSessionKnexStore } = connectSessionKnex;

export const sessionMiddleware = session({
  name: "cesta.sid",
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.nodeEnv === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 14
  },
  store: new ConnectSessionKnexStore({
    knex: db,
    tablename: "sessions",
    createTable: false,
    sidfieldname: "sid"
  })
});
