const Meeting = require('../models/meetingTable');

// 날짜별 회의 테이블 내역 조회
exports.allTable = async (req, res) => {
    try {
        const selectedDate = new Date(req.params.date) || new Date();
        console.log(selectedDate);
        const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()); // Y M D H M S
        const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
        const meetings = await Meeting.find({
            startTime: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).sort({ startTime: 1 });
        res.json(meetings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// 회의 테이블 예약 생성
exports.addTable = async (req, res) => {
    const { member, startTime, endTime, club } = req.body;
    try {
        const newMeeting = new Meeting({
            member,
            startTime : new Date(startTime),
            endTime: new Date(endTime),
            club
        });

        await newMeeting.save();
      res.status(200).json({ message: 'success' });
    } catch (error) {
      res.status(400).json({ message: error.message});
    }
}