export enum TeacherActionTypes {

	SIGNUP = "TEACHER_SIGNUP",
	SIGNUP_SUCCEED = "TEACHER_SIGNUP_SUCCEED",
	SIGNUP_FAILURE = "TEACHER_SIGNUP_FAILURE",

	LOGIN = "TEACHER_LOGIN",
	LOGIN_SUCCEED = "TEACHER_LOGIN_SUCCEED",
	LOGIN_FAILURE = "TEACHER_LOGIN_FAILURE",

	LOGOUT = "TEACHER_LOGOUT",

	UPDATE_PROFILE = "TEACHER_UPDATE_PROFILE",
	UPDATE_PROFILE_SUCCEED = "TEACHER_UPDATE_PROFILE_SUCCEED",
	UPDATE_PROFILE_FAILURE = "TEACHER_UPDATE_PROFILE_FAILURE",

	VIDEOS_ASSESSMENTS = "TEACHER_PORTAL_VIDEOS_ASSESSMENTS",
	VIDEOS_ASSESSMENTS_SUCCESS = "TEACHER_PORTAL_VIDEOS_ASSESSMENTS_SUCCESS",
	VIDEOS_ASSESSMENTS_FAILURE = "TEACHER_PORTAL_VIDEOS_ASSESSMENTS_FAILURE"
}

export const FinalAssessment = {
	introduction: "یہ کورس کا آخری مرحلہ ہے. کورس ختم کرنے کے لئے آپ کو یہ فائنل اسائنمنٹ (final assignment) مکمل کرنی ہے. تمام سوالوں کو پڑھ کر ان کے تفصیل سے جواب ایک کاغز پر لکھیں. آپ لکھے ہوے جواب کی تصویر کے ساتھ ساتھ دوسری تصویر اور وائس نوٹ (voice note) بھی بھیج سکتے ہیں. اپنے جواب اپنے اور اپنے اسکول کے نام کے ساتھ ہمیں اس نمبر پر واٹساپ اپ (whatsapp) کریں.",
	questions: [
		"جب بچے کووڈ کی چھٹیوں سے اسکول واپس آۓ، تو آپ نے ان کو جانچا؟ آپ نے جانچنے کے لئے کون سا آلہ استمعال کیا؟ بچے کتنا کچھ بھول چکے تھے؟",
		"کیا آپ نے اپنی جماعت تقسیم کی؟ اگر ہاں، تو آپ کے تقسیم کرنے کے پیچھے کیا لاجک (logic) تھا؟",
		"	آپ نے بچوں کو اپنے لیسن کیسے سمجھائے؟ کیا آپ نے اپنے لیسن میں کتاب  سے مختلف کوئی سرگرمیوں کا استمعال کیا؟",
		"آپ نے بچوں کی سوشل اموشنل لرننگ (social emotional learning) کے لئے کیا کیا؟ اس کی کوئی مثال دیجئے سرگرمیوں (Activities)  کی صورت میں ؟",
		"کیا آپ نے اپنی جماعت کی سیٹنگ (seating) بدلی؟ ہمیں تصاویر بھیج کے دکھائے کیسے بدلی ؟",
		"اس سب میں آپ کے لئے کون سی کامیابی فخر کا ذریعہ بنی؟"
	]
}