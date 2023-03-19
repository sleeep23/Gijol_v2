/* eslint-disable */
import path from 'path';
import {readFile, WorkSheet} from 'xlsx';
import yargs from "yargs";

const TYPE_CELL_INDEX = 'A';
const CODE_CELL_INDEX = 'B';
const COURSE_NAME_CELL_INDEX = 'D';
const CREDIT_CELL_INDEX = 'E';
const GRADE_CELL_INDEX = 'F';
const VALUE_KEY = 'v';
const START_INDEX = 3;

export class GradeReportParser {
  public static async readXlsxFile(file: any): Promise<void> {
    const filePath = path.resolve(__dirname, 'grade_report.xls');
    const workSheet = this.createSheet(filePath);
    const studentId = this.parseStudentId(workSheet);

    let index = START_INDEX;
    const address = (cell: string, row: number) => cell + row;

    while (index !== 100) {
      index += 1;

      let year, semester;
      if (this.isSeparatedByYear(workSheet, address(COURSE_NAME_CELL_INDEX, index))) {
        [year, semester] = this.parseYearAndSemester(workSheet, address(COURSE_NAME_CELL_INDEX, index));
      }

      if (this.notExistCodeRow(workSheet, address(CODE_CELL_INDEX, index))) {
        continue;
      }

      if (this.isEndOfCode(workSheet, index)) {
        break;
      }


      const type = this.accessValueOfWorkSheet(workSheet, address(TYPE_CELL_INDEX, index))
      const code = this.accessValueOfWorkSheet(workSheet, address(CODE_CELL_INDEX, index))
      const course = this.accessValueOfWorkSheet(workSheet, address(COURSE_NAME_CELL_INDEX, index))
      const credit = this.accessValueOfWorkSheet(workSheet, address(CREDIT_CELL_INDEX, index))
      const grade = this.accessValueOfWorkSheet(workSheet, address(GRADE_CELL_INDEX, index));
      console.log(type, code, course, credit, grade);

    }
  }

  private static isEndOfCode(workSheet: WorkSheet, index: number) {
    const workSheetIdx = CODE_CELL_INDEX + index.toString();
    const workSheetElement: string = workSheet[workSheetIdx][VALUE_KEY];
    return workSheetElement !== undefined && workSheetElement.includes('[학사]');
  }

  private static notExistCodeRow(workSheet: WorkSheet, excelAddress: string) {
    const workSheetElement = this.accessValueOfWorkSheet(workSheet, excelAddress);
    return !workSheetElement || workSheetElement === 'Code';
  }

  private static isSeparatedByYear(workSheet: WorkSheet, excelAddress: string) {
    let workSheetElement = this.accessValueOfWorkSheet(workSheet, excelAddress);
    return workSheetElement && workSheetElement.includes('학기>');
  }

  private static parseYearAndSemester(workSheet: WorkSheet, excelAddress: string) {
    const workSheetElement = this.accessValueOfWorkSheet(workSheet, excelAddress);
    const elementWithNoWhitespace = workSheetElement.trim();
    const [year, semester] = elementWithNoWhitespace.substring(1, elementWithNoWhitespace.length - 1).split('/');
    return [year, semester];
  }

  private static accessValueOfWorkSheet(workSheet: WorkSheet, excelAddress: string): string {
    if (excelAddress in workSheet) {
      const workSheetElement = workSheet[excelAddress];
      if (VALUE_KEY in workSheetElement) {
        return workSheetElement[VALUE_KEY];
      }
    }

    return '';
  }

  private static parseStudentId(workSheet: any) {
    const studentIdString = workSheet.A2[VALUE_KEY];
    return studentIdString.split(':')[1].trim(); // format: StudentNo.:20205185
  }

  private static createSheet(file: any) {
    const workBook = readFile(file);
    const sheetNames = workBook.SheetNames;
    if (sheetNames.length > 1) throw Error('유효하지 않은 파일입니다.');
    const sheetName = sheetNames[0];
    return workBook.Sheets[sheetName];
  }
}

GradeReportParser.readXlsxFile('');
