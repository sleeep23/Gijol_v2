import { UserTakenCourse, UserType } from '../../types';

export const getPeriodWithTakenCourse = (data: UserType) => {
  const initYear = data.userTakenCourseList.at(0)?.year as number;
  const finalYear = data.userTakenCourseList.at(-1)?.year as number;
  const semesters = ['1학기', '여름학기', '2학기', '겨울학기'];

  let result = [];

  for (let i = initYear; i <= finalYear; i++) {
    for (const j in semesters) {
      result.push({
        period: `${i}년도 ${semesters[j]}`,
        userTakenCourseList: data.userTakenCourseList.filter(
          (course) => course.year === i && course.semester === semesters[j]
        ),
      });
    }
  }
  return result;
};

export const getCntTab = (href: string) => {
  switch (href) {
    case '/dashboard':
      return '홈';
    case '/dashboard/course':
      return '내 졸업요건';
    case '/dashboard/course/my':
      return '내 강의 현황';
    case '/dashboard/course/search':
      return '강의 정보 확인하기';
    default:
      return '홈';
  }
};

export const getUserScoreFromTakenCourseList = (list: Array<UserTakenCourse>) => {
  let totalGrade = 0;
  let totalCredit = 0;
  for (let i = 0; i < list.length; i++) {
    const credit = list[i].credit;
    const grade = gradeToNumber(list[i].grade);

    if (!isNaN(credit) && !isNaN(grade)) {
      totalCredit += credit;
      totalGrade += credit * grade;
    }
  }

  return Math.floor((totalGrade / totalCredit) * 100) / 100;
};

export const gradeToNumber = (grade: string) => {
  switch (grade) {
    case 'A+':
      return 4.5;
    case 'A0':
      return 4.0;
    case 'B+':
      return 3.5;
    case 'B0':
      return 3.0;
    case 'C+':
      return 2.5;
    case 'C0':
      return 2.0;
    case 'D+':
      return 1.5;
    case 'D0':
      return 1.0;
    case 'F':
      return 0;
    case 'S':
      return NaN;
    default:
      return NaN;
  }
};
