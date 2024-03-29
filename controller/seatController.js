const Seat = require('../models/seat');
const SeatHistory = require('../models/seatHistory');
const Member = require('../models/member');

// 내 좌석 대여 조회
exports.checkMySeat = async (req, res) => {
    try {
        const member = await Member.findOne({ kakaoId : req.token.kakaoId });
        if (!member) {
            return res.status(400).json({
                msg: "세션이 종료됐거나 사용자가 올바르지 않음."
            });
        }

        const seat = await Seat.findOne({ memberId: member._id });
        if (seat !== null) {
            res.status(200).json({
                seatNumber: seat.number,
                startTime : seat.startTime
            });
        } else {
            res.status(200).json({
                message: "이용 중인 좌석이 없습니다."
            });
        }
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
}

// 좌석 대여
exports.rentSeat = async (req, res) => {
    const { seatNumber } = req.body;

    try {
        // 현재 인증된 사용자의 정보를 조회
        const member = await Member.findOne({ kakaoId : req.token.kakaoId });
        if (!member) {
            return res.status(404).json({ message: '회원을 찾을 수 없습니다.' });
        }

        // 해당 좌석을 조회
        const seat = await Seat.findOne({ number: seatNumber, club: member.club });
        if (!seat) {
            return res.status(404).json({ message: '좌석을 찾을 수 없습니다.' });
        }

        // 좌석 상태 업데이트
        seat.status = 'using';
        seat.startTime = new Date();
        seat.memberId = member.id;
        await seat.save();

        res.status(200).json({ message: '좌석 대여 완료' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};

// 좌석 반납
exports.returnSeat = async (req, res) => {
    try {
        // 현재 인증된 사용자의 정보를 조회
        const member = await Member.findOne({ kakaoId : req.token.kakaoId });
        if (!member) {
            return res.status(404).json({ message: '회원을 찾을 수 없습니다.' });
        }

        // 해당 좌석을 조회
        const seat = await Seat.findOne({ memberId: member._id });
        if (!seat) {
            return res.status(404).json({ message: '좌석을 찾을 수 없습니다.' });
        }

        // 좌석이 이미 사용 중인 경우
        if (seat.status === 'notUsed') {
            return res.status(400).json({ message: '이미 반납된 좌석입니다.' });
        }

        // 좌석 이용 히스토리 생성
        await SeatHistory.create({
            memberName : member.name,
            studentId : member.studentId,
            club : member.club,
            seatNumber : seat.number,
            seatStartTime : seat.startTime,
            seatEndTime : Date.now(),
            memberId : member.id
        });

        // 좌석 상태 업데이트
        seat.status = 'notUsed';
        seat.startTime = null;
        seat.memberId = null;
        await seat.save();

        res.status(200).json({ message: '좌석 반납 완료' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};

// 좌석 조회
exports.getSeatsStatus = async (req, res) => {
    const club = req.params.club;

    try {
        // 해당 클럽의 모든 좌석 조회
        const seats = await Seat.find({ club }).sort({ number: 1 });
        const seatsStatus = await Promise.all(seats.map(async (seat) => {
            // 각 좌석에 대해 memberId로 member 조회
            const member = await Member.findOne({ _id : seat.memberId });
            return {
                seatNumber: seat.number,
                seatStatus: seat.status,
                studentId: member ? member.studentId : null,
                memberName: member ? member.name : null,
                memberProfile: member ? member.profile : null,
                startTime: seat.startTime
            };
        }));

        res.json(seatsStatus);
    } catch (error) {
        res.status(500).json({ message: '서버 오류' });
    }
};