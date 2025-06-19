``` abap

*&---------------------------------------------------------------------*
*& Include ZC103FIR0006TOP                          - Report ZC103FIR0006
*&---------------------------------------------------------------------*
REPORT zc103fir0006 MESSAGE-ID zmsgc103.

**********************************************************************
*TABLES
**********************************************************************
TABLES : zc103fit0001.

**********************************************************************
* Macro
**********************************************************************
DEFINE _init.

  REFRESH &1.
  CLEAR &1.

END-OF-DEFINITION.

**********************************************************************
* Class instance
**********************************************************************

**********************************************************************
* Internal table and work area
**********************************************************************
DATA : BEGIN OF gs_header.
         INCLUDE STRUCTURE zc103fit0001.
DATA:    endat   TYPE zc103fit0001-budat, "마감일
         hkontd  TYPE zc103fit0003-txt50,
         overdue TYPE p,
         wrbtr   TYPE wrbtr,
       END OF gs_header,
       gt_header LIKE TABLE OF gs_header.

DATA: BEGIN OF gs_item.
        INCLUDE STRUCTURE zc103fit0002.
DATA:   txt50 TYPE zc103fit0003-txt50,
      END OF gs_item,
      gt_item LIKE TABLE OF gs_item.

DATA: BEGIN OF gs_03,
        saknr TYPE zc103fit0003-saknr,
        txt50 TYPE zc103fit0003-txt50,
      END OF gs_03,
      gt_03 LIKE TABLE OF gs_03.

DATA: BEGIN OF gs_11,
        empno   TYPE zc103fit0011-empno,
        dptcode TYPE zc103fit0011-dptcode,
        empname TYPE zc103fit0011-empname,
        telno   TYPE zc103fit0011-telno,
        email   TYPE zc103fit0011-email,
      END OF gs_11,
      gt_11 LIKE TABLE OF gs_11.

*-- For ALV
DATA : gt_fcat    TYPE lvc_t_fcat,
       gt_sort    TYPE lvc_t_sort,
       gs_fcat    TYPE lvc_s_fcat,
       gs_sort    TYPE lvc_s_sort,
       gs_layout  TYPE lvc_s_layo,
       gs_variant TYPE disvariant.

DATA : gt_pfcat TYPE lvc_t_fcat,
       gs_pfcat TYPE lvc_s_fcat.


DATA : gt_ui_functions TYPE ui_functions,  " Exclude ALV Toolbar
       gs_button       TYPE stb_button.    " ALV Toolbar button

*-- For tree
DATA : BEGIN OF gs_tree,
         bpid   TYPE zc103sdt0001-bpid,
         bpname TYPE zc103sdt0001-bpname,
         bptype TYPE zc103sdt0001-bptype,
       END OF gs_tree,
       gt_tree LIKE TABLE OF gs_tree,
       BEGIN OF gs_bptype,
         bptype     TYPE zc103sdt0001-bptype,
         bptypename TYPE string,
       END OF gs_bptype,
       gt_bptype LIKE TABLE OF gs_bptype.

**********************************************************************
* Declaration area for NODE
**********************************************************************
TYPES: node_table_type LIKE STANDARD TABLE OF mtreesnode
                       WITH DEFAULT KEY.
DATA: node_table TYPE node_table_type.

**********************************************************************
* Class Instance
**********************************************************************
DATA : go_container        TYPE REF TO cl_gui_docking_container,
       go_split_cont       TYPE REF TO cl_gui_splitter_container,
       go_left_cont        TYPE REF TO cl_gui_container,
       go_right_cont       TYPE REF TO cl_gui_container,

       go_right_split_cont TYPE REF TO cl_gui_splitter_container,
       go_right_left_cont  TYPE REF TO cl_gui_container,
       go_right_right_cont TYPE REF TO cl_gui_container,

       go_tree_grid        TYPE REF TO cl_gui_alv_grid,
       go_alv_grid         TYPE REF TO cl_gui_alv_grid,
       go_tree             TYPE REF TO cl_gui_simple_tree.

DATA: go_popup_container TYPE REF TO cl_gui_dialogbox_container,
      go_popup_splitter  TYPE REF TO cl_gui_splitter_container,
      go_popup_top_cont  TYPE REF TO cl_gui_container,
      go_popup_html_cont TYPE REF TO cl_gui_dialogbox_container,
      go_html_view       TYPE REF TO cl_gui_html_viewer.

DATA: go_item_popup_container TYPE REF TO cl_gui_custom_container,
      go_item_alv_grid        TYPE REF TO cl_gui_alv_grid.

DATA: go_html_control TYPE REF TO cl_gui_custom_container.

**********************************************************************
* Declaration area for Tree event
**********************************************************************
DATA: events TYPE cntl_simple_events,
      event  TYPE cntl_simple_event.

**********************************************************************
* Common variable
**********************************************************************
DATA : gv_okcode          TYPE sy-ucomm,
       gv_mode            VALUE 'D', " Mode value
       gv_selected_bpname TYPE zc103fit0001-bp_name.

*-- For Chart
DATA : gv_length  TYPE i,
       gv_xstring TYPE xstring.

*-- For Chart Category Count
DATA: gv_cnt_asset     TYPE i VALUE 0,
      gv_cnt_liability TYPE i VALUE 0,
      gv_cnt_capital   TYPE i VALUE 0,
      gv_cnt_expense   TYPE i VALUE 0,
      gv_cnt_revenue   TYPE i VALUE 0.

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

DATA: gv_html_url TYPE string.

----------------------------------------------------------------------------------
Extracted by Direct Download Enterprise version 1.3.1 - E.G.Mellodew. 1998-2005 UK. Sap Release 758
