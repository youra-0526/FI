``` abap
*&---------------------------------------------------------------------*
*& Include ZC103FIR0008TOP                          - Report ZC103FIR0008
*&---------------------------------------------------------------------*
REPORT zc103fir0008 MESSAGE-ID zmsgc103.

CLASS cl_gui_column_tree DEFINITION LOAD.
CLASS cl_gui_cfw DEFINITION LOAD.

**********************************************************************
* TABLES
**********************************************************************
TABLES : zc103fit0001, zc103fit0002, zc103fit0003, zc103fit0022.

**********************************************************************
* MACRO
**********************************************************************
DEFINE _dock.

  CREATE OBJECT &1
    EXPORTING
      side      = &1->dock_at_left
      extension = 5000.

  CREATE OBJECT &2
    EXPORTING
      i_parent = &1.

END-OF-DEFINITION.

**********************************************************************
* Class Instance
**********************************************************************
*-- Sale Plan Instance
DATA: go_tree          TYPE REF TO cl_gui_alv_tree,
      go_container     TYPE REF TO cl_gui_docking_container,
      go_change_menu   TYPE REF TO cl_ctmenu,
      go_alv_grid      TYPE REF TO cl_gui_alv_grid,

*-- For Top-of-page -------------------------------------------------*
      go_top_container TYPE REF TO cl_gui_docking_container,
      go_dyndoc_id     TYPE REF TO cl_dd_document,
      go_html_cntrl    TYPE REF TO cl_gui_html_viewer.

**********************************************************************
* Internal table and Work area
*********************************************************************
DATA: gs_hierhdr         TYPE treev_hhdr,
      gs_variant         TYPE disvariant,
      gt_list_commentary TYPE slis_t_listheader.

DATA: gt_events TYPE cntl_simple_events,
      gs_event  TYPE cntl_simple_event.

*-- 일반 alv 용 fcat
DATA : gt_fcat   TYPE lvc_t_fcat,
       gs_fcat   TYPE lvc_s_fcat,
       gs_layout TYPE lvc_s_layo.

*-- alv tree 용 fcat
DATA : gt_item_layout TYPE lvc_t_layi.

*-- Tree 계층별 매핑을 위함
TYPES: BEGIN OF ty_node_key,
         node_id TYPE zc103fit0019-node_id,
         key     TYPE lvc_nkey,
       END OF ty_node_key.

DATA: lt_node_key_map TYPE HASHED TABLE OF ty_node_key
                       WITH UNIQUE KEY node_id,
      ls_key_map      TYPE ty_node_key.

*-- Tree 계층합계 계산을 위함
TYPES : BEGIN OF ty_sum,
          node_id     TYPE zc103fit0022-node_id,
          parent_node TYPE zc103fit0022-parent_node_id,
          node_name   TYPE zc103fit0022-node_name,
          prev_amt    TYPE zc103fit0002-wrbtr,
          curr_amt    TYPE zc103fit0002-wrbtr,
        END OF ty_sum.

**-- Cell color 지정을 위함
TYPES: BEGIN OF ty_cellcolor,
         fieldname TYPE lvc_fname,
         color     TYPE lvc_s_scol,
       END OF ty_cellcolor.

TYPES: ty_cellcolor_tab TYPE STANDARD TABLE OF ty_cellcolor WITH DEFAULT KEY.

*-- ALV Tree DATA ITAB and wa
DATA : BEGIN OF gs_bsdata.
         INCLUDE STRUCTURE zc103fit0022.
DATA :   prev_amt  TYPE zc103fit0002-wrbtr,   "전기금액
         prev_curr TYPE zc103fit0002-k_waers,   "전기통화
         curr_amt  TYPE zc103fit0002-wrbtr,   "당기금액
         curr_curr TYPE zc103fit0002-k_waers,   "당기통화
         cellcolor TYPE lvc_t_scol,
         excel_row TYPE i,          "엑셀 pdf 출력용
       END OF gs_bsdata,
       gt_bsdata LIKE TABLE OF gs_bsdata.

*-- For ALV top
DATA :   gt_top LIKE TABLE OF gs_bsdata.

**********************************************************************
* Common variable
**********************************************************************
DATA : gv_okcode TYPE sy-ucomm,
       save_ok   TYPE sy-ucomm.

DATA : gv_logo TYPE sdydo_value.

*-- For file browser
DATA : objfile       TYPE REF TO cl_gui_frontend_services,
       pickedfolder  TYPE string,
       initialfolder TYPE string,
       fullinfo      TYPE string,
       pfolder       TYPE rlgrap-filename. "MEMORY ID mfolder.

*-- For Excel
DATA: gv_tot_page   LIKE sy-pagno,          " Total page
      gv_percent(3) TYPE n,                 " Reading percent
      gv_file       LIKE rlgrap-filename .  " File name

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
      borders     TYPE ole2_object,
      gv_date_to  TYPE budat.

*-- For select box
DATA : gs_vrm_name  TYPE vrm_id,
       gs_vrm_posi  TYPE vrm_values,
       gs_vrm_value LIKE LINE OF gs_vrm_posi.
DATA : gt_value LIKE t093t OCCURS 0 WITH HEADER LINE.

DATA: cell1 TYPE ole2_object,
      cell2 TYPE ole2_object.

DATA: gv_total TYPE wrbtr.
