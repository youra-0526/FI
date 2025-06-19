``` abap
*&---------------------------------------------------------------------*
*& Include ZC103FIR007TOP                           - Report ZC103FIR0007
*&---------------------------------------------------------------------*
REPORT zc103fir0007  MESSAGE-ID zmsgc103.

**********************************************************************
* TABLES
**********************************************************************
TABLES : zc103fit0001, zc103fit0002, zc103fit0003.

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
DATA : go_container   TYPE REF TO cl_gui_docking_container,
       go_split_cont  TYPE REF TO cl_gui_splitter_container,
       go_top_cont    TYPE REF TO cl_gui_container,
       go_bottom_cont TYPE REF TO cl_gui_container,
       go_pop_cont    TYPE REF TO cl_gui_custom_container,
       go_top_grid    TYPE REF TO cl_gui_alv_grid,
       go_bottom_grid TYPE REF TO cl_gui_alv_grid,
       go_pop_grid    TYPE REF TO cl_gui_alv_grid.

**********************************************************************
* Internal table and Work area
**********************************************************************
*-- Internal table and Work area
DATA: BEGIN OF gs_body,
*        bukrs      TYPE bukrs,    " 회사코드
        gjahr      TYPE zc103fit0002-gjahr,    " 회계연도
        hkont      TYPE zc103fit0002-hkont,    " G/L 계정
        gl_txt     TYPE zc103fit0003-txt50,    " 계정명
        debit_sum  TYPE zc103fit0002-dmbtr,    " 차변 합계
        credit_sum TYPE zc103fit0002-dmbtr,    " 대변 합계
        balance_dr TYPE zc103fit0002-dmbtr,    " 차변 잔액
        balance_cr TYPE zc103fit0002-dmbtr,    " 대변 잔액
        k_waers    TYPE zc103fit0002-k_waers VALUE 'KRW',
      END OF gs_body,
      gt_body LIKE TABLE OF gs_body.

DATA : BEGIN OF gs_gltext,
         saknr TYPE saknr,
         txt50 TYPE txt50,
       END OF gs_gltext,
       gt_gltext LIKE TABLE OF gs_gltext.


DATA: gt_backup TYPE TABLE OF zc103fit0003.

DATA : gt_fit03  TYPE TABLE OF zc103fit0003,
       gs_fit03  TYPE zc103fit0003,
       gs_backup TYPE zc103fit0003.

*전표 헤더
DATA: BEGIN OF gs_hbody.
        INCLUDE STRUCTURE zc103fit0001.
DATA:   ltext(10),
      END OF gs_hbody,
      gt_hbody LIKE TABLE OF gs_hbody.

*전표 아이템
DATA: BEGIN OF gs_ibody.
        INCLUDE STRUCTURE zc103fit0002.
DATA:   txt50 TYPE zc103fit0003-txt50,
      END OF gs_ibody,
      gt_ibody LIKE TABLE OF gs_ibody.

*-- Fieldcatalog table and Structure
DATA : gt_topfcat      TYPE lvc_t_fcat,
       gs_topfcat      TYPE lvc_s_fcat,
       gt_botfcat      TYPE lvc_t_fcat,
       gs_botfcat      TYPE lvc_s_fcat,
       gt_popfcat      TYPE lvc_t_fcat,
       gs_popfcat      TYPE lvc_t_fcat,

       gs_toplayout    TYPE lvc_s_layo,
       gs_botlayout    TYPE lvc_s_layo,
       gs_poplayout    TYPE lvc_s_layo,
       gt_sort         TYPE lvc_t_sort,
       gs_cell_tab     TYPE lvc_s_styl,
       gs_variant      TYPE disvariant,
       gs_button       TYPE stb_button,
       gt_ui_functions TYPE ui_functions.

**********************************************************************
* Common variable
**********************************************************************
*-- System feild
DATA : gv_okcode  TYPE sy-ucomm,
       gv_tabix   TYPE sy-tabix,
       gv_subrc   TYPE sy-subrc,
       gv_dbcnt   TYPE sy-dbcnt,
       gv_str     TYPE string,
       gv_int     TYPE i,
       gv_msg(50).

DATA: gv_month TYPE c LENGTH 2. "셀렉트 옵션 전기월

*-- For select box
DATA : gs_vrm_name  TYPE vrm_id,
       gs_vrm_posi  TYPE vrm_values,
       gs_vrm_value LIKE LINE OF gs_vrm_posi.

----------------------------------------------------------------------------------
Extracted by Direct Download Enterprise version 1.3.1 - E.G.Mellodew. 1998-2005 UK. Sap Release 758
