``` abap
*&---------------------------------------------------------------------*
*& Include ZC103FIR0012TOP                          - Report ZC103FIR0012
*&---------------------------------------------------------------------*
REPORT zc103fir0012 MESSAGE-ID zmsgc103.

**********************************************************************
* TABLES
**********************************************************************
TABLES : zc103fit0011.

**********************************************************************
* Class Instance
**********************************************************************
*-- Sale Plan Instance
DATA :go_container     TYPE REF TO cl_gui_custom_container,       "메인 컨테이너
      pop_container    TYPE REF TO cl_gui_custom_container,       "팝업 컨테이너
      pop_containeremp TYPE REF TO cl_gui_custom_container,       "직원 상세 팝업 컨테이너
      go_alv_grid      TYPE REF TO cl_gui_alv_grid.               "ALV 그리드 객체

**********************************************************************
* Internal table and Work area
**********************************************************************
*-- Internal table and Work area
DATA : BEGIN OF gs_emp, "직원정보
         empno       TYPE zc103fit0011-empno,                     "사번
         dptcode     TYPE zc103fit0011-dptcode,                   "부서 코드
         empname     TYPE zc103fit0011-empname,                   "직원명
         telno       TYPE zc103fit0011-telno,                     "전화번호
         birth       TYPE zc103fit0011-birth,                     "생년월일
         gender      TYPE zc103fit0011-gender,                    "성별
         email       TYPE zc103fit0011-email,                     "이메일
         joindate    TYPE zc103fit0011-joindate,                  "입사일자
         resdate     TYPE zc103fit0011-resdate,                   "퇴사일자
         emppos      TYPE zc103fit0011-emppos,                    "직급
         approver_yn TYPE zc103fit0011-approver_yn,               "결재권자 여부
         erdat       TYPE zc103fit0011-erdat,                     "생성일
         Erzet       type zc103fit0011-erzet,                     "생성시간
         ernam       type zc103fit0011-ernam,                     "생성자
         aedat       type zc103fit0011-aedat,                     "변경일
         aezet       type zc103fit0011-aezet,                     "변경시간
         aenam       type zc103fit0011-aenam,                     "변경자
         cell_tab    type lvc_t_styl,                             "alv 스타일 정보
         modi_yn,                                                 "수정 여부
         dotext      type dd07v-ddtext,                           "부서 텍스트
         numtext     type dd07v-ddtext,                           "직급 텍스트
         gentext     TYPE dd07v-ddtext,                           "성별 텍스트
       END OF gs_emp,
       gt_emp LIKE TABLE OF gs_emp.

*-- 사진 데이터
DATA: gt_wwwtab LIKE wwwparams OCCURS 0 WITH HEADER LINE.

*-- 사진 인스턴스
DATA: pic TYPE REF TO cl_gui_picture,                             "사진 표시 객체
      con TYPE REF TO cl_gui_custom_container.                    "사진 컨테이너

DATA: gt_emp_d TYPE TABLE OF zc103fit0011,                        " 삭제 데이터 저장 용 ITAB
      gs_emp_d TYPE zc103fit0011,                                 " 삭제 데이터 저장 용 WA
      gt_emp_s TYPE TABLE OF zc103fit0011.                        " 수정 데이터 Transparent Table 반영 용 ITAB

DATA : BEGIN OF gs_selected_body.                                 "선택된 행 구조
         INCLUDE STRUCTURE zc103fit0011.
DATA:    cell_tab   TYPE lvc_t_styl,                              "alv 스타일 정보
         modi_yn,                                                 "수정 여부
         dotext     TYPE dd07v-ddtext,                            "부서 텍스트
         numtext    TYPE dd07v-ddtext,                            "직급 텍스트
         gentext    TYPE dd07v-ddtext,                            "성별 텍스트
       END OF gs_selected_body,
       gt_selected_body LIKE TABLE OF gs_selected_body.

*--엑셀 관련 파일 선언
DATA: BEGIN OF gs_excel,
        empno       TYPE zc103fit0011-empno,
        dptcode     TYPE zc103fit0011-dptcode,
        empname     TYPE zc103fit0011-empname,
        telno       TYPE zc103fit0011-telno,
        birth       TYPE zc103fit0011-birth,
        gender      TYPE zc103fit0011-gender,
        email       TYPE zc103fit0011-email,
        joindate    TYPE zc103fit0011-joindate,
        resdate     TYPE zc103fit0011-resdate,
        emppos      TYPE zc103fit0011-emppos,
        approver_yn TYPE zc103fit0011-approver_yn,
      END OF gs_excel,
      gt_excel LIKE TABLE OF gs_excel.

*-- Fieldcatalog table and Structure
DATA : gt_fcat         TYPE lvc_t_fcat,                           "필드카탈로그 테이블
       gs_fcat         TYPE lvc_s_fcat,                           "필드카탈로그 구조
       gs_layout       TYPE lvc_s_layo,                           "ALV 레이아웃 구조
       gt_item_sort    TYPE lvc_t_sort,                           "정렬 기준 목록
       gs_cell_tab     TYPE lvc_s_styl,                           "셀 스타일 구조
       gs_variant      TYPE disvariant,                           "ALV Variant 구조
       gs_button       TYPE stb_button,                           "툴바 버튼 구조
       gt_ui_functions TYPE ui_functions.                         "ALV 기능 테이블

**********************************************************************
* Common variable
**********************************************************************
*-- System feild
DATA : gv_okcode   TYPE sy-ucomm,                                "OK 코드
       gv_tabix    TYPE sy-tabix,                                "TABIX
       gv_subrc    TYPE sy-subrc,                                "RETURN CODE
       gv_dbcnt    TYPE sy-dbcnt,                                "DB 처리건수
       gv_str      TYPE string,                                  "문자열 저장
       gv_int      TYPE i,                                       "숫자형 임시값
       gv_mode     VALUE 'D',                                    "모드 플래그
       gv_msg(50),                                               "메시지 텍스트
       gv_empno    TYPE zc103fit0011-empno,                      "직원번호
       gv_dptcode  TYPE zc103fit0011-dptcode,                    "부서코드
       gv_empname  TYPE zc103fit0011-empname,                    "직원명
       gv_name     TYPE zc103fit0011-empname,                    "팝업용 직원명
       gv_telno    TYPE zc103fit0011-telno,                      "전화번호
       gv_birth    TYPE zc103fit0011-birth,                      "생년월일
       gv_gender   TYPE zc103fit0011-gender,                     "성별
       gv_email    TYPE zc103fit0011-email,                      "이메일
       gv_joindate TYPE zc103fit0011-joindate,                   "입사일자
       gv_epos     TYPE zc103fit0011-emppos,                     "직급
       gv_techid   TYPE zc103fit0011-empno,                      "직원번호 저장용

*--정보생성 팝업창
       pv_empname  TYPE zc103fit0011-empname,                    "이름
       pv_dptcode  TYPE zc103fit0011-dptcode,                    "사원번호
       pv_telno    TYPE zc103fit0011-telno,                      "전화번호
       pv_birth    TYPE zc103fit0011-birth,                      "생년월일
       pv_gender   TYPE zc103fit0011-gender,                     "성별
       pv_email    TYPE zc103fit0011-email,                      "이메일
       pv_joindate TYPE zc103fit0011-joindate,                   "입사일자
       pv_emppos   TYPE zc103fit0011-emppos.                     "직급

*--사진 관련 변수
DATA : objfile       TYPE REF TO cl_gui_frontend_services,       "프론트엔드 서비스
       pickedfolder  TYPE string,                                "선택된 폴더 경로
       initialfolder TYPE string,                                "초기 폴더 경로
       fullinfo      TYPE string,                                "전체 경로 문자열
       pfolder       TYPE rlgrap-filename.                       "기억된 폴더

DATA : url TYPE cndp_url.                                        "이미지 URL

DATA : gv_temp_filename     LIKE rlgrap-filename,                "임시 파일명
       gv_temp_filename_pdf LIKE rlgrap-filename,                "임시 PDF 파일명
       gv_form(40).                                              "스마트폼 명칭

*--엑셀 관련 객체
DATA: excel       TYPE ole2_object,
      workbook    TYPE ole2_object,
      books       TYPE ole2_object,
      book        TYPE ole2_object,
      sheets      TYPE ole2_object,
      sheet       TYPE ole2_object,
      activesheet TYPE ole2_object,
      application TYPE ole2_object,
      pagesetup   TYPE ole2_object,
      cells       TYPE ole2_object,
      cell        TYPE ole2_object,
      row         TYPE ole2_object,
      buffer      TYPE ole2_object,
      font        TYPE ole2_object,
      range       TYPE ole2_object,
      borders     TYPE ole2_object.

DATA: cell1 TYPE ole2_object,
      cell2 TYPE ole2_object.

*-- 엑셀 업로드 변수
DATA: gv_tot_page   LIKE sy-pagno,                              " Total page
      gv_percent(3) TYPE n,                                     " Reading percent
      gv_file       LIKE rlgrap-filename .                      " File name

DATA: lt_excel_raw TYPE TABLE OF alsmex_tabline,                " 엑셀 원본 데이터를 저장할 인터널테이블
      ls_raw       TYPE alsmex_tabline,                         " 엑셀 원본 데이터의 개별 행을 저장하는 구조
      lt_excel     LIKE gt_emp_s,                               " 변환된 데이터를 저장할 인터널테이블
      ls_excel     LIKE LINE OF gt_emp_s,                       " 개별 행 데이터를 저장할 구조
      lv_file      TYPE rlgrap-filename,                        " 업로드할 엑셀 파일의 경로를 저장할 변수
      lv_value     TYPE string.                                 " 개별 셀 값을 저장할 변수
