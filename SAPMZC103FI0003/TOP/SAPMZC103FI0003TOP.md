``` abap
*&---------------------------------------------------------------------*
*& Include SAPMZC103FI0003TOP                       - Module Pool      SAPMZC103FI0003
*&---------------------------------------------------------------------*
PROGRAM sapmzc103fi0003 MESSAGE-ID zmsgc103.

*************************************
* TABLES
*************************************
TABLES : zc103fit0001, zc103fit0002, zc103fit0014, zc103fit0021.

*************************************
* Class Instance
*************************************
DATA : go_container TYPE REF TO cl_gui_custom_container,  "메인 Container
       go_alv_grid  TYPE REF TO cl_gui_alv_grid,          "감가상각대상 자산 list
       go_pop_cont  TYPE REF TO cl_gui_custom_container,  "팝업 Container
       go_pop_grid  TYPE REF TO cl_gui_alv_grid.          "감가상각이력 팝업 ALV

*************************************
* Itab and wa
*************************************
DATA : BEGIN OF gs_body.
         INCLUDE STRUCTURE zc103fit0014.
DATA :
         monat      TYPE zc103fit0021-monat,
         status     TYPE icon_d,
         modi_yn    TYPE c,
         cell_tab   TYPE lvc_t_styl,
         classtext  TYPE dd07v-ddtext, "자산클래스 필드 description
         methodtext TYPE dd07v-ddtext, "감가상각방법 필드 description
       END OF gs_body,
       gt_body LIKE TABLE OF gs_body.

*-- 감가상각이력 팝업 관련
DATA : BEGIN OF gs_data,
         row_no   TYPE i,
         buzei    TYPE zc103fit0002-buzei,
         gjahr    TYPE zc103fit0002-gjahr,
         belnr    TYPE zc103fit0002-belnr,
         budat    TYPE zc103fit0002-budat,
         accum    TYPE zc103fit0014-accum,
         aprice   TYPE zc103fit0014-aprice,
         currency TYPE zc103fit0014-currency,
*---여기서 부터 추가 필드
         status   TYPE icon_d,
         modi_yn  TYPE c,
         cell_tab TYPE lvc_t_styl,
       END OF gs_data,
       gt_data LIKE TABLE OF gs_data.

**-- 전표 생성자 지정 관련
*DATA : gs_hbody TYPE zc103fit0001,
*       gt_hbody TYPE TABLE OF zc103fit0001.

*--- 검색조건
DATA: p_gjahr TYPE gjahr,
      p_monat TYPE monat,
      p_anln1 TYPE anln1.

*************************************
* For ALV
*************************************
DATA : gt_fcat    TYPE lvc_t_fcat,
       gs_fcat    TYPE lvc_s_fcat,
       gt_pfcat   TYPE lvc_t_fcat, "팝업 ALV fcat
       gs_pfcat   TYPE lvc_s_fcat, "팝업 ALV fcat
       gs_layout  TYPE lvc_s_layo,
       gs_playout TYPE lvc_s_layo, "팝업 layout
       gs_variant TYPE disvariant,
       gt_sort    TYPE lvc_t_sort. "정렬

DATA : gt_ui_functions TYPE ui_functions,  " Exclude ALV Toolbar
       gs_button       TYPE stb_button.    " ALV Toolbar button

*************************************
* Common Variable
*************************************
DATA : gv_okcode TYPE sy-ucomm,
       gv_mode   VALUE 'D', " Mode value
       gv_gjahr  TYPE zc103fit0021-gjahr,
       gv_monat  TYPE zc103fit0021-monat.
