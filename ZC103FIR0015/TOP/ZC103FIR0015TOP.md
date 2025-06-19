``` abap
*&---------------------------------------------------------------------*
*& Include ZC103FIR0015TOP                          - Report ZC103FIR0015
*&---------------------------------------------------------------------*
REPORT zc103fir0015.

**********************************************************************
*TABLES
**********************************************************************
TABLES : zc103fit0002.

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
DATA : go_container TYPE REF TO cl_gui_custom_container,
       go_alv_grid  TYPE REF TO cl_gui_alv_grid.

**********************************************************************
* Internal table and work area
**********************************************************************

DATA: gs_header LIKE zc103fit0001,
      gt_header LIKE TABLE OF zc103fit0001.
DATA: BEGIN OF gs_item.
        INCLUDE STRUCTURE zc103fit0002.
DATA:   glname TYPE zc103fit0003-txt50,
      END OF gs_item,
      gt_item LIKE TABLE OF gs_item.

DATA: BEGIN OF gs_gl,
        hkont TYPE zc103fit0003-saknr,
        txt50 TYPE zc103fit0003-txt50,
      END OF gs_gl,
      gt_gl LIKE TABLE OF gs_gl.

*-- 사원번호 search help
DATA : BEGIN OF gs_emp_value,
         empno   TYPE zc103fit0011-empno,
         empname TYPE zc103fit0011-empname,
       END OF gs_emp_value,
       gt_emp_value LIKE TABLE OF gs_emp_value.

DATA: gt_gl_master TYPE TABLE OF zc103fit0003,
      gs_gl_master TYPE zc103fit0003.

DATA: BEGIN OF gs_gl_value,
        saknr TYPE zc103fit0003-saknr,
        txt50 TYPE zc103fit0003-txt50,
      END OF gs_gl_value,
      gt_gl_value LIKE TABLE OF gs_gl_value.

DATA: BEGIN OF gs_bp_value,
        bpid   TYPE zc103sdt0001-bpid,
        bpname TYPE zc103sdt0001-bpname,
      END OF gs_bp_value,
      gt_bp_value LIKE TABLE OF gs_bp_value.

DATA: BEGIN OF gs_bschl_value,
        bschl TYPE zc103fit0002-bschl,
        txt   TYPE text_bslt,
      END OF gs_bschl_value,
      gt_bschl_value LIKE TABLE OF gs_bschl_value.

DATA : gt_delt TYPE TABLE OF zc103fit0002, " 삭제용 Internal table
       gs_delt TYPE zc103fit0002.

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
DATA : gv_okcode TYPE sy-ucomm,
       gv_mode   VALUE 'D'. " Mode value

DATA: gv_bukrs  TYPE zc103fit0001-bukrs,
      gv_gjahr  TYPE zc103fit0001-gjahr,
      gv_bldat  TYPE zc103fit0001-bldat,
      gv_blart  TYPE zc103fit0001-blart,
      gv_waers  TYPE zc103fit0001-waers,
      gv_budat  TYPE zc103fit0001-budat,
      gv_mblnr  TYPE zc103fit0001-mblnr,
      gv_bktxt  TYPE zc103fit0001-bktxt,
      gv_uscode TYPE zc103fit0001-uscode,
      gv_usname TYPE zc103fit0001-usname,
      gv_bpid   TYPE zc103fit0001-bp_id,
      gv_bpname TYPE zc103fit0001-bp_name,

      gv_bschl  TYPE zc103fit0002-bschl,
      gv_hkont  TYPE zc103fit0002-hkont,
      gv_txt50  TYPE zc103fit0003-txt50,
      gv_wrbtr  TYPE zc103fit0002-wrbtr,
      gv_sgtxt  TYPE zc103fit0002-sgtxt,

      gv_s      TYPE zc103fit0002-wrbtr,
      gv_h      TYPE zc103fit0002-wrbtr,
      gv_dif    TYPE zc103fit0002-wrbtr,
      gv_bschld TYPE text_bslt,
      gv_check.
