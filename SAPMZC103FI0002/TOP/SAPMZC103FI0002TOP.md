``` abap
*&---------------------------------------------------------------------*
*& Include SAPMZC103FI0002TOP                       - Module Pool      SAPMZC103FI0002
*&---------------------------------------------------------------------*
PROGRAM sapmzc103fi0002 MESSAGE-ID zmsgc103.

*************************************
* TABLES
*************************************
TABLES : zc103fit0014.

*************************************
* Class Instance
*************************************
*-- 고정자산 리스트 조회 ALV
DATA : go_container       TYPE REF TO cl_gui_custom_container,
       go_alv_grid        TYPE REF TO cl_gui_alv_grid,
       go_chart_container TYPE REF TO cl_gui_container, "chart container
       go_split_cont      TYPE REF TO cl_gui_splitter_container,
       go_base_container  TYPE REF TO cl_gui_container.

*-- 새로운 고정자산 취득 팝업
DATA : go_pop_cont TYPE REF TO cl_gui_custom_container,
       go_pop_alv  TYPE REF TO cl_gui_alv_grid.

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

*************************************
* Internal table and work area
*************************************
DATA: gt_asset_list TYPE TABLE OF zc103fit0014,
      gs_asset_list TYPE zc103fit0014.

DATA: gs_new_asset TYPE zc103fit0014. "고정자산 취득 값을 담는 변수

*-- 고정자산 취득팝업 screen painter 변수(사용자가 입력하는 값을 담는 변수)
DATA: p_anln1    TYPE zc103fit0014-anln1,       "자산번호
      p_anlnt    TYPE zc103fit0014-anlnt,       "자산명
      p_gjahr    TYPE zc103fit0014-gjahr,       "취득연도
      p_anlkl    TYPE zc103fit0014-anlkl,       "자산클래스
      p_aprice   TYPE zc103fit0014-aprice,      "취득가격
      p_currency TYPE zc103fit0014-currency,    "통화
      p_afasl    TYPE zc103fit0014-afasl,       "감가상각방법
      p_alife    TYPE zc103fit0014-alife,       "내용연수
      p_bktxt    TYPE zc103fit0001-bktxt.       "헤더 적요

DATA: BEGIN OF gs_body.
        INCLUDE STRUCTURE zc103fit0014.
DATA:   modi_yn    TYPE c,
        cell_tab   TYPE lvc_t_styl, "ALV 편집 스타일 확인하는 칼럼
        classtext  TYPE dd07v-ddtext,
        methodtext TYPE dd07v-ddtext,
      END OF gs_body,
      gt_body LIKE TABLE OF gs_body.

*-- 삭제용 itab and wa
DATA : gt_delt TYPE TABLE OF zc103fit0014,
       gs_delt TYPE zc103fit0014.

*-- For ALV
DATA : gt_fcat     TYPE lvc_t_fcat, "selected 자산 조회 fcat
       gs_fcat     TYPE lvc_s_fcat, "selected 자산 조회 fcat
       gt_all_fcat TYPE lvc_t_fcat, "all 자산 조회 fcat
       gs_all_fcat TYPE lvc_s_fcat, "all 자산 조회 fcat
       gt_pfcat    TYPE lvc_t_fcat, "새로운 고정자산 취득 팝업 fcat
       gs_pfcat    TYPE lvc_s_fcat, "새로운 고정자산 취득 팝업 fcat
       gs_layout   TYPE lvc_s_layo,
       gs_variant  TYPE disvariant.

DATA : gt_ui_functions TYPE ui_functions,  " Exclude ALV Toolbar
       gs_button       TYPE stb_button.    " ALV Toolbar button

*************************************
* Common variable
*************************************
DATA : gv_okcode          TYPE sy-ucomm,
       gv_mode            VALUE 'D', " Mode value
       gv_class           TYPE zc103fit0014-anlkl,
       gv_asset           TYPE zc103fit0014-anlnt,
       gv_gjahr           TYPE zc103fit0014-gjahr,
       gv_description(30).

*************************************
* For Chart
*************************************
DATA : gv_length  TYPE i,
       gv_xstring TYPE xstring.

DATA : gv_cnt_flight  TYPE i VALUE 0, "항공기
       gv_cnt_vehicle TYPE i VALUE 0, "운송수단
       gv_cnt_site    TYPE i VALUE 0, "시설수단
       gv_cnt_uld     TYPE i VALUE 0, "팔레트/화물장비
       gv_cnt_it      TYPE i VALUE 0, "IT/사무자산
       gv_cnt_inasset TYPE i VALUE 0, "무형자산
       gv_cnt_stasset TYPE i VALUE 0. "소모품/재고자산
