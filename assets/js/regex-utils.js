/**
 * RegEx Utility Collection
 * 자주 사용하는 정규식 함수 모음집
 */

const RegexUtils = {
    // 1. 검증 (Validation)
    
    // 이메일 형식 체크
    isEmail: (str) => {
        const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return reg.test(str);
    },

    // 휴대폰 번호 체크 (한국 기준: 010-XXXX-XXXX)
    isPhoneNumber: (str) => {
        const reg = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
        return reg.test(str);
    },

    // 비밀번호 복잡성 체크 (8자 이상, 영문, 숫자, 특수문자 포함)
    isStrongPassword: (str) => {
        const reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return reg.test(str);
    },

    // 사업자 등록번호 체크 (000-00-00000)
    isBusinessNumber: (str) => {
        const reg = /^\d{3}-\d{2}-\d{5}$/;
        return reg.test(str);
    },

    // 한글만 포함되어 있는지 체크
    isKorean: (str) => {
        const reg = /^[가-힣]+$/;
        return reg.test(str);
    },

    // 2. 추출 및 치환 (Sanitization & Extraction)

    // 숫자만 남기기 (문자 제거)
    keepOnlyNumbers: (str) => {
        return str.replace(/[^0-9]/g, '');
    },

    // 특수문자 제거
    stripSpecialChars: (str) => {
        return str.replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, '');
    },

    // 공백 모두 제거
    stripWhitespace: (str) => {
        return str.replace(/\s+/g, '');
    },

    // 3. 포맷팅 (Formatting)

    // 숫자에 콤마 찍기 (금액 표기)
    formatCurrency: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // 휴대폰 번호 하이픈 자동 삽입
    formatPhoneNumber: (str) => {
        const cleaned = str.replace(/[^0-9]/g, '');
        return cleaned.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
    },

    // HTML 태그 제거 (텍스트만 추출)
    stripHtmlTags: (str) => {
        return str.replace(/<[^>]*>?/gm, '');
    }
};

// 사용 예시:
// console.log(RegexUtils.isEmail("test@example.com")); // true
// console.log(RegexUtils.formatCurrency(1250000));     // "1,250,000"
// console.log(RegexUtils.keepOnlyNumbers("abc123def")); // "123"
