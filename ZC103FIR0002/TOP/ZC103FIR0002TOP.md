``` abap 
*&---------------------------------------------------------------------*
*& Include ZC103FIR0002TOP                          - Report ZC103FIR0002
*&---------------------------------------------------------------------*
REPORT zc103fir0002 MESSAGE-ID zmsgc103.  " 메시지 클래스 지정

**********************************************************************
* TABLES
**********************************************************************
TABLES : zc103fit0001,  " 전표 헤더 테이블
         zc103fit0002.  " 전표 상세 테이블

**********************************************************************
* Macros
**********************************************************************
DEFINE _first_display.
  " ALV 첫 표시 시 테이블 세팅을 위한 매크로
  gs_variant-handle = &2.
  CALL METHOD &1->set_table_for_first_display
    EXPORTING
      is_variant      = gs_variant
      i_save          = 'A'  " 사용자 저장 가능
      i_default       = 'X'  " 기본으로 사용
      is_layout       = gs_layout
    CHANGING
      it_outtab       = &3   " 출력 데이터
      it_fieldcatalog = &4.  " 필드 카탈로그
END-OF-DEFINITION.

DEFINE _popup_to_confirm.
  " 확인 팝업 호출 매크로
  CALL FUNCTION 'POPUP_TO_CONFIRM'
    EXPORTING
      text_question         = &1
      text_button_1         = 'Yes'(001)
      text_button_2         = 'No'(002)
      display_cancel_button = 'X'
    IMPORTING
      answer                = &2
    EXCEPTIONS
      text_not_found        = 1
      OTHERS                = 2.
END-OF-DEFINITION.

DEFINE _init.
  " 내부 테이블 초기화용 매크로
  REFRESH &1. " 기존 값 삭제
  CLEAR &1.   " 초기화
END-OF-DEFINITION.

**********************************************************************
* Containers & ALV Instances
**********************************************************************
DATA: go_top_container TYPE REF TO cl_gui_docking_container,   " 상단 설명 영역
      go_doc_container TYPE REF TO cl_gui_docking_container,   " 전체 화면 컨테이너
      go_html_cntrl    TYPE REF TO cl_gui_html_viewer,         " HTML Viewer
      go_dyndoc_id     TYPE REF TO cl_dd_document,             " 문서 구성용 객체

      go_splitter      TYPE REF TO cl_gui_splitter_container,  " ALV 분할 컨테이너
      go_container1    TYPE REF TO cl_gui_container,           " 상단 ALV 컨테이너
      go_container2    TYPE REF TO cl_gui_container,           " 하단 ALV 컨테이너

      go_alv_grid1     TYPE REF TO cl_gui_alv_grid,            " 전표 헤더 ALV
      go_alv_grid2     TYPE REF TO cl_gui_alv_grid.            " 전표 상세 ALV

**********************************************************************
* Internal Tables and Work Areas
**********************************************************************
DATA: BEGIN OF gs_hbody.
        INCLUDE STRUCTURE zc103fit0001.  " 헤더 구조 포함
DATA:   ltext(10),                        " 전표유형 텍스트
        color     TYPE lvc_t_scol,       " 색상 테이블
      END OF gs_hbody,
      gt_hbody LIKE TABLE OF gs_hbody.   " 헤더 내부 테이블

DATA: BEGIN OF gs_selected_header.
        INCLUDE STRUCTURE zc103fit0001.  " 선택된 헤더 구조
DATA:   ltext TYPE c LENGTH 10,          " 전표유형 텍스트
      END OF gs_selected_header,
      gt_selected_header LIKE TABLE OF gs_selected_header.  " 선택된 헤더 테이블

DATA: gs_hbody_db TYPE zc103fit0001.     " DB insert용 워크에어리어

DATA: BEGIN OF gs_ibody.
        INCLUDE STRUCTURE zc103fit0002.  " 상세 구조 포함
DATA:   txt50 TYPE zc103fit0003-txt50,   " 계정명
      END OF gs_ibody,
      gt_ibody LIKE TABLE OF gs_ibody.   " 상세 내부 테이블

DATA: BEGIN OF gs_selected_item.
        INCLUDE STRUCTURE zc103fit0002.  " 선택된 상세 구조
DATA:   txt50     TYPE zc103fit0003-txt50,  " 계정명
        bpcode(8),                        " 거래처 코드
      END OF gs_selected_item,
      gt_selected_item LIKE TABLE OF gs_selected_item.  " 선택된 상세 테이블

DATA: BEGIN OF gs_03,
        saknr TYPE zc103fit0003-saknr,   " 계정 코드
        txt50 TYPE zc103fit0003-txt50,   " 계정 설명
      END OF gs_03,
      gt_03 LIKE TABLE OF gs_03.         " 계정 마스터 테이블

**********************************************************************
* ALV Layout & Field Catalog
**********************************************************************
DATA: gt_fcat    TYPE lvc_t_fcat,      " 헤더 ALV 필드카탈로그
      gs_fcat    TYPE lvc_s_fcat,
      gt_fcat2   TYPE lvc_t_fcat,      " 상세 ALV 필드카탈로그
      gs_fcat2   TYPE lvc_s_fcat,
      gs_layout1 TYPE lvc_s_layo,      " 헤더 ALV 레이아웃
      gs_layout2 TYPE lvc_s_layo,      " 상세 ALV 레이아웃
      gs_variant TYPE disvariant.      " ALV 레이아웃 variant

DATA: gt_ui_functions TYPE ui_functions,  " ALV toolbar 버튼 제외
      gs_button       TYPE stb_button.    " 툴바 버튼 정보

**********************************************************************
* Common Variables
**********************************************************************
DATA: gv_okcode TYPE sy-ucomm,       " 화면 동작 코드
      gv_mode   VALUE 'D'.           " 모드 구분 값 ('D': 조회 등)

*-- For select box
DATA : gs_vrm_name  TYPE vrm_id,     " 리스트박스 ID
       gs_vrm_posi  TYPE vrm_values, " 리스트박스 값 목록
       gs_vrm_value LIKE LINE OF gs_vrm_posi. " 개별 리스트 항목
DATA : gt_value LIKE t093t OCCURS 0 WITH HEADER LINE. " 리스트박스 설정용

RANGES gr_group FOR zc103fit0001-blart.  " 전표유형 조건

DATA : objfile       TYPE REF TO cl_gui_frontend_services,  " 프론트엔드 서비스 객체
       pickedfolder  TYPE string,                           " 사용자가 선택한 폴더
       initialfolder TYPE string,                           " 초기 폴더 경로
       fullinfo      TYPE string,                           " 전체 경로 문자열
       pfolder       TYPE rlgrap-filename.                  " 마지막 경로 저장용

DATA : gv_temp_filename     LIKE rlgrap-filename,  " 임시파일명
       gv_temp_filename_pdf LIKE rlgrap-filename,  " PDF 저장용 파일명
       gv_form(40).                               " 다운로드 템플릿 이름

DATA: excel       TYPE ole2_object,  " Excel 전체 객체
      workbook    TYPE ole2_object,  " Workbook 객체
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
      range       TYPE ole2_object,  " 범위 설정
      borders     TYPE ole2_object.

DATA: cell1 TYPE ole2_object,  " 셀 오브젝트 1
      cell2 TYPE ole2_object.  " 셀 오브젝트 2

*-- For Excel
DATA: gv_tot_page   LIKE sy-pagno,          " 총 페이지 수
      gv_percent(3) TYPE n,                 " 진행률 표시
      gv_file       LIKE rlgrap-filename.   " 파일명

DATA: lt_excel_raw TYPE TABLE OF alsmex_tabline,  " 엑셀 원본 데이터 테이블
      ls_raw       TYPE alsmex_tabline,           " 원본 데이터 행 구조
      lt_excel     LIKE gt_selected_header,       " 변환된 엑셀 데이터
      ls_excel     LIKE LINE OF gt_selected_header, " 개별 엑셀 데이터 행
      lv_file      TYPE rlgrap-filename,          " 업로드 파일 경로
      lv_value     TYPE string.                   " 개별 셀 값

----------------------------------------------------------------------------------
Extracted by Direct Download Enterprise version 1.3.1 - E.G.Mellodew. 1998-2005 UK. Sap Release 758
