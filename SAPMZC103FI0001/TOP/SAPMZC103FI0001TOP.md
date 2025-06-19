``` abap
*&---------------------------------------------------------------------*
*& Include SAPMZC103FI0001TOP                       - Module Pool      SAPMZC103FI0001
*&---------------------------------------------------------------------*
PROGRAM sapmzc103fi0001 MESSAGE-ID zmsgc103.

* 로컬클래스 사용시 (static이 아닌 메서드 사용시)
* CLASS lcl_event_handler DEFINITION DEFERRED.

**********************************************************************
*TABLES
**********************************************************************
TABLES : zc103fit0003.

**********************************************************************
* TAB Strip controls
**********************************************************************
CONTROLS gc_tab TYPE TABSTRIP.      " TAB Strip object

DATA : gv_subscreen TYPE sy-dynnr.  " Subscreen number


**********************************************************************
* Macro
**********************************************************************
DEFINE _popup_to_confirm.

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


**********************************************************************
* Class instance
**********************************************************************
DATA : go_container       TYPE REF TO cl_gui_container,
       go_alv_grid        TYPE REF TO cl_gui_alv_grid,
       go_chart_container TYPE REF TO cl_gui_container,
       go_split_cont      TYPE REF TO cl_gui_splitter_container,
       go_base_container  TYPE REF TO cl_gui_custom_container.

*-- For Chart
DATA : go_chart    TYPE REF TO cl_gui_chart_engine.

DATA : go_ixml          TYPE REF TO if_ixml,
       go_ixml_sf       TYPE REF TO if_ixml_stream_factory,
       go_ixml_docu     TYPE REF TO if_ixml_document,
       go_ixml_ostream  TYPE REF TO if_ixml_ostream,
       go_ixml_encoding TYPE REF TO if_ixml_encoding.

DATA: go_chartdata  TYPE REF TO if_ixml_element,
      go_categories TYPE REF TO if_ixml_element,
      go_category   TYPE REF TO if_ixml_element,
      go_series     TYPE REF TO if_ixml_element,
      go_point      TYPE REF TO if_ixml_element,
      go_value      TYPE REF TO if_ixml_element.

**********************************************************************
* Internal table and work area
**********************************************************************
DATA: BEGIN OF gs_body.
        INCLUDE STRUCTURE zc103fit0003.
DATA:   modi_yn  TYPE c,
        cell_tab TYPE lvc_t_styl,
      END OF gs_body,
      gt_body LIKE TABLE OF gs_body.

DATA : BEGIN OF gs_excel,
         bukrs TYPE zc103fit0003-bukrs,
         saknr TYPE zc103fit0003-saknr,
         txt50 TYPE zc103fit0003-txt50,
         xintb TYPE zc103fit0003-xintb,
         xloev TYPE zc103fit0003-xloev,
         waers TYPE zc103fit0003-waers,
       END OF gs_excel,
       gt_excel LIKE TABLE OF gs_excel.



DATA : BEGIN OF gs_selected_body.
         INCLUDE STRUCTURE zc103fit0003.
DATA:    modi_yn, "edit시 변경이 되었는지 체크하는 컬럼
         cell_tab TYPE lvc_t_styl,  " ALV Edit style
       END OF gs_selected_body,
       gt_selected_body LIKE TABLE OF gs_selected_body.

DATA : gt_delt TYPE TABLE OF zc103fit0003, " 삭제용 Internal table
       gs_delt TYPE zc103fit0003.

*-- For ALV
DATA : gt_fcat    TYPE lvc_t_fcat,
       gs_fcat    TYPE lvc_s_fcat,
       gs_layout  TYPE lvc_s_layo,
       gs_variant TYPE disvariant.

DATA : gt_ui_functions TYPE ui_functions,  " Exclude ALV Toolbar
       gs_button       TYPE stb_button.    " ALV Toolbar button

**********************************************************************
* Common variable
**********************************************************************
DATA : gv_okcode          TYPE sy-ucomm,
       gv_mode            VALUE 'D', " Mode value
       gv_saknr           TYPE zc103fit0003-saknr,
       gv_saknr_gr_cd     TYPE zc103fit0003-saknr_gr_cd,
       gv_description(30).

DATA : objfile       TYPE REF TO cl_gui_frontend_services,
       pickedfolder  TYPE string,
       initialfolder TYPE string,
       fullinfo      TYPE string,
       pfolder       TYPE rlgrap-filename. "MEMORY ID mfolder.

DATA : gv_temp_filename     LIKE rlgrap-filename,
       gv_temp_filename_pdf LIKE rlgrap-filename,
       gv_form(40).

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
      range       TYPE ole2_object,  " Range
      borders     TYPE ole2_object.

DATA: cell1 TYPE ole2_object,
      cell2 TYPE ole2_object.

*-- For Excel
DATA: gv_tot_page   LIKE sy-pagno,          " Total page
      gv_percent(3) TYPE n,                 " Reading percent
      gv_file       LIKE rlgrap-filename .  " File name

DATA: lt_excel_raw TYPE TABLE OF alsmex_tabline,  " 엑셀 원본 데이터를 저장할 인터널테이블
      ls_raw       TYPE alsmex_tabline,           " 엑셀 원본 데이터의 개별 행을 저장하는 구조
      lt_excel     LIKE gt_selected_body,          " 변환된 데이터를 저장할 인터널테이블
      ls_excel     LIKE LINE OF gt_selected_body,                   " 개별 행 데이터를 저장할 구조
      lv_file      TYPE rlgrap-filename,          " 업로드할 엑셀 파일의 경로를 저장할 변수
      lv_value     TYPE string.                   " 개별 셀 값을 저장할 변수

*-- For Chart
DATA : gv_length  TYPE i,
       gv_xstring TYPE xstring.

*-- For Chart Category Count
DATA: gv_cnt_asset     TYPE i VALUE 0,
      gv_cnt_liability TYPE i VALUE 0,
      gv_cnt_capital   TYPE i VALUE 0,
      gv_cnt_expense   TYPE i VALUE 0,
      gv_cnt_revenue   TYPE i VALUE 0.
