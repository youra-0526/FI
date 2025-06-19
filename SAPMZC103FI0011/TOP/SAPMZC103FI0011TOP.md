``` abap
*&---------------------------------------------------------------------*
*& Include SAPMZC103FI0011TOP                       - Module Pool      SAPMZC103FI0011
*&---------------------------------------------------------------------*
PROGRAM sapmzc103fi0011 MESSAGE-ID zmsgc103.

**********************************************************************
* TABLES
**********************************************************************
TABLES : zc103fit0001, zc103fit0002 , zc103fit0011.

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
* Class Instance
**********************************************************************
*-- Sale Plan Instance
DATA : go_container   TYPE REF TO cl_gui_custom_container,
       go_split_cont  TYPE REF TO cl_gui_splitter_container,
       go_top_cont    TYPE REF TO cl_gui_container,
       go_bottom_cont TYPE REF TO cl_gui_container,
       go_top_grid    TYPE REF TO cl_gui_alv_grid,
       go_bottom_grid TYPE REF TO cl_gui_alv_grid.

**********************************************************************
* Internal table and Work area
**********************************************************************
*-- Internal table and Work area
*DATA : BEGIN OF gs_item,
*
*       END OF gs_item,
*       gt_item LIKE TABLE OF gs_item.

*전표 헤더
DATA: BEGIN OF gs_hbody.
        INCLUDE STRUCTURE zc103fit0001.
DATA:   status1  TYPE icon_d, "전표상태
        status2  TYPE icon_d, "결재상테
        cell_tab TYPE lvc_t_styl,                  "ALV EDIT Style
        modi_yn,
        rejdate  TYPE sy-datum,
        color_tab TYPE lvc_t_scol,
      END OF gs_hbody,
      gt_hbody LIKE TABLE OF gs_hbody.

*전표 아이템
DATA: BEGIN OF gs_ibody.
        INCLUDE STRUCTURE zc103fit0002.
DATA:   txt50 TYPE zc103fit0003-txt50,
      END OF gs_ibody,
      gt_ibody LIKE TABLE OF gs_ibody.

DATA : BEGIN OF gs_selected_hbody.
         INCLUDE STRUCTURE zc103fit0001.
DATA:    status1  TYPE icon_d, "전표상태
         status2  TYPE icon_d, "결재상테
         cell_tab TYPE lvc_t_styl,                  "ALV EDIT Style
         modi_yn,
         rejdate  TYPE sy-datum,
         color_tab TYPE lvc_t_scol,
       END OF gs_selected_hbody,
       gt_selected_hbody LIKE TABLE OF gs_selected_hbody.

DATA : BEGIN OF gs_gltext,
         saknr TYPE saknr,
         txt50 TYPE txt50,
       END OF gs_gltext,
       gt_gltext LIKE TABLE OF gs_gltext.

DATA: gt_backup TYPE TABLE OF zc103fit0003.

DATA : gt_fit03  TYPE TABLE OF zc103fit0003,
       gs_fit03  TYPE zc103fit0003,
       gs_backup TYPE zc103fit0003.

*-- Fieldcatalog table and Structure
DATA :
  gt_topfcat      TYPE lvc_t_fcat,
  gs_topfcat      TYPE lvc_s_fcat,
  gt_botfcat      TYPE lvc_t_fcat,
  gs_botfcat      TYPE lvc_s_fcat,
  gs_toplayout    TYPE lvc_s_layo,
  gs_botlayout    TYPE lvc_s_layo,
  gt_sort         TYPE lvc_t_sort,
  gs_cell_tab     TYPE lvc_s_styl,
  gs_variant      TYPE disvariant,
  gs_button       TYPE stb_button,
  gt_ui_functions TYPE ui_functions.

*-- For select box (Listbox for 결재상태)
DATA : gs_vrm_name  TYPE vrm_id,              " 리스트박스 필드 이름
       gs_vrm_posi  TYPE vrm_values,          " 전체 값 테이블
       gs_vrm_value LIKE LINE OF gs_vrm_posi. " 각 항목

**********************************************************************
* Common variable
**********************************************************************
*-- System feild
DATA : gv_okcode    TYPE sy-ucomm,
       gv_tabix     TYPE sy-tabix,
       gv_subrc     TYPE sy-subrc,
       gv_dbcnt     TYPE sy-dbcnt,
       gv_str       TYPE string,
       gv_int       TYPE i,
       gv_msg(50),
       gv_gjahr     TYPE zc103fit0001-gjahr,
       gv_bstat(1),
       gv_belnr     TYPE zc103fit0001-belnr,
       gv_rejday    TYPE sy-datum,
       gv_appno     TYPE zc103fit0001-approcode,
       gv_appname   TYPE zc103fit0001-approname,
       gv_apppos(2).

DATA : go_text_con  TYPE REF TO cl_gui_custom_container,
       go_text_edit TYPE REF TO cl_gui_textedit.

DATA: BEGIN OF gs_text,
        tdline(200),
      END OF gs_text,
      gt_text LIKE TABLE OF gs_text.

DATA: go_text_con2  TYPE REF TO cl_gui_custom_container,
      go_text_edit2 TYPE REF TO cl_gui_textedit.

DATA: BEGIN OF gs_textview,
        tdline(200),
      END OF gs_textview,
      gt_textview LIKE TABLE OF gs_textview.
