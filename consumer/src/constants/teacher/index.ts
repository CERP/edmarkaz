enum TeacherActionTypes {

	SIGNUP = "TEACHER_SIGNUP",
	SIGNUP_SUCCEED = "TEACHER_SIGNUP_SUCCEED",
	SIGNUP_FAILURE = "TEACHER_SIGNUP_FAILURE",

	LOGIN = "TEACHER_LOGIN",
	LOGIN_SUCCEED = "TEACHER_LOGIN_SUCCEED",
	LOGIN_FAILURE = "TEACHER_LOGIN_FAILURE",

	UPDATE_PROFILE = "TEACHER_UPDATE_PROFILE",
	UPDATE_PROFILE_SUCCEED = "TEACHER_UPDATE_PROFILE_SUCCEED",
	UPDATE_PROFILE_FAILURE = "TEACHER_UPDATE_PROFILE_FAILURE",

	VIDEOS_ASSESSMENTS = "TEACHER_PORTAL_VIDEOS_ASSESSMENTS",
	VIDEOS_ASSESSMENTS_SUCCESS = "TEACHER_PORTAL_VIDEOS_ASSESSMENTS_SUCCESS",
	VIDEOS_ASSESSMENTS_FAILURE = "TEACHER_PORTAL_VIDEOS_ASSESSMENTS_FAILURE"
}

export {
	TeacherActionTypes
}