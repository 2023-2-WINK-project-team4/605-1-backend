const express = require('express')
const passport = require('passport')
const authRouter = express.Router()
const { logout} = require('../controller/authController')
const Member = require("../models/member");
const {generateToken, verifyToken} = require("../util/auth/jwtHelper");
require('dotenv').config()


// 로그인 인가 요청
authRouter.get("/login", (req, res, next) => {
    try {
        const token = req.headers.authorization;
        req.token = verifyToken(token);

        return res.status(200).json({
            msg: "success",
            token : token
        })
    } catch(error) {
        return next();
    }
}, passport.authenticate("kakao"));

// 로그인 콜백 요청
authRouter.get(
    "/login/callback", passport.authenticate('kakao'), (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(400).json({
                    msg: "사용자가 존재하지 않음."
                })
            }

            if (user.name === null) {
                // 회원가입으로!
                return res.status(200).json({
                    msg : "sign_up",
                    kakaoId: user.kakaoId
                })
            } else {
                const token = generateToken(user);
                // 메인 화면으로!
                return res.status(200).json({
                    msg: "success",
                    token : token
                })
            }
        } catch (error) {
            next(error);
        }
    }
);

// 로그아웃
authRouter.get('/logout', logout)

// 회원 가입 라우터
authRouter.post('/join',async (req, res, next) => {
    try {
        // 받은 값으로 회원 가입 완료.
        const user = await Member.updateOne({ kakaoId: req.body.kakaoId }, {
            $set: {
                name: req.body.name,
                studentId: req.body.studentId,
                club: req.body.club,
            }
        });

        req.login(user, (error) => { // 새로운 로그인 세션을 생성한다.
            if (error) {
                next(error);
            }
            const token = generateToken(user);

            return res.status(200).json({
                token : token,
                msg: "회원 가입 성공",
            })
        });
    } catch (error) {
        next(error)
    }
});

module.exports = authRouter;