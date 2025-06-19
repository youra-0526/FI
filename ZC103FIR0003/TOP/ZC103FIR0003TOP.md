``` abap
*&---------------------------------------------------------------------*
*& Include ZC103FIR0003TOP                          - Report ZC103FIR0003
*&---------------------------------------------------------------------*
REPORT zc103fir0003 MESSAGE-ID zmsgc103.

**********************************************************************
* TABLES
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
* Class Instance
**********************************************************************
*-- Sale Plan Instance
DATA : go_container  TYPE REF TO cl_gui_custom_container,
       go_alv_grid   TYPE REF TO cl_gui_alv_grid,
       go_container2 TYPE REF TO cl_gui_custom_container,
       go_alv_grid2  TYPE REF TO cl_gui_alv_grid.

**********************************************************************
* TAB Strip Controls
**********************************************************************
*-- TAB Strip object
CONTROLS : gc_tab TYPE TABSTRIP.
*-- Subscreen number
DATA : gv_subscreen TYPE sy-dynnr.

**********************************************************************
* Internal table and Work area
**********************************************************************
*-- Internal table and Work area

DATA : BEGIN OF gs_item,
         gjahr   TYPE zc103fit0002-gjahr,
         belnr   TYPE zc103fit0002-belnr,
         waers   TYPE zc103fit0002-waers,
         k_waers TYPE zc103fit0002-k_waers,
         budat   TYPE zc103fit0002-budat,
         dmbtr   TYPE zc103fit0002-dmbtr,
         wrbtr   TYPE zc103fit0002-wrbtr,
         zmonat  TYPE char2,                "전기월을 담을 필드,
         bp_id   TYPE zc103fit0002-bp_id,   "공급업체 id, 고객 id
         bp_name TYPE zc103fit0002-bp_name,    "mm 공급업체 이름
       END OF gs_item,
       gt_item LIKE TABLE OF gs_item.

DATA : BEGIN OF gs_item2,
         gjahr   TYPE zc103fit0002-gjahr,
         belnr   TYPE zc103fit0002-belnr,
         waers   TYPE zc103fit0002-waers,
         k_waers TYPE zc103fit0002-k_waers,
         budat   TYPE zc103fit0002-budat,
         wrbtr   TYPE zc103fit0002-wrbtr,
         dmbtr   TYPE zc103fit0002-dmbtr,
         zmonat  TYPE char2,                "전기월 필드,
         bp_id   TYPE zc103fit0002-bp_id,
         bp_name TYPE zc103fit0002-bp_name,
       END OF gs_item2,
       gt_item2 LIKE TABLE OF gs_item2.
**********************************************************************
*-- Fieldcatalog table and Structure
DATA : gt_fcat         TYPE lvc_t_fcat,
       gs_fcat         TYPE lvc_s_fcat,
       gt_fcat2        TYPE lvc_t_fcat,
       gs_fcat2        TYPE lvc_s_fcat,
       gs_layout       TYPE lvc_s_layo,
       gt_item_sort    TYPE lvc_t_sort,
       gs_cell_tab     TYPE lvc_s_styl,
       gs_variant      TYPE disvariant,
       gs_button       TYPE stb_button,
       gt_ui_functions TYPE ui_functions.

**Search help
DATA: BEGIN OF gs_mmbp_value,
        bpid TYPE zc103mmt0002-bpid,
        name TYPE zc103mmt0002-name,
      END OF gs_mmbp_value,
      gt_mmbp_value LIKE TABLE OF gs_mmbp_value.

DATA: BEGIN OF gs_bp_value,
        custid TYPE zc103sdt0002-custid,
        name   TYPE zc103sdt0002-name,
      END OF gs_bp_value,
      gt_bp_value LIKE TABLE OF gs_bp_value.

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

*-- For ALV List box
DATA : gt_drop TYPE lvc_t_drop,
       gs_drop TYPE lvc_s_drop.

*-- For select box
DATA : gs_vrm_name  TYPE vrm_id,
       gs_vrm_posi  TYPE vrm_values,
       gs_vrm_value LIKE LINE OF gs_vrm_posi.

DATA: pa_bp  TYPE zc103fit0002-bp_id, " mm 거래처 ID 입력 필드
      pa_bp1 TYPE zc103fit0002-bp_id, " sd  고객ID 입력 필드
      pa_bp2 TYPE zc103fit0002-bp_id. " sd  bpID 입력 필드

DATA: gv_cnt    TYPE i,
      gv_cnt2   TYPE i,      " i는 8자리
*      gv_total  TYPE wrbtr,
*      gv_cuky   TYPE waer VALUE 'KRW',
*      gv_total2 TYPE wrbtr,
*      gv_cuky2  TYPE waers VALUE 'KRW'.

      gv_total  TYPE dmbtr,
      gv_cuky   TYPE waers VALUE 'KRW',
      gv_total2 TYPE wrbtr,
      gv_cuky2  TYPE waers VALUE 'KRW',

*--서치헬프 변수
      gv_vendor TYPE zc103fit0001-bp_name, " 서치헬프  bpname 반영해주는 변수
      gv_bpname TYPE zc103fit0001-bp_name. " 서치헬프  bpname 반영해주는 변수

----------------------------------------------------------------------------------
Extracted by Direct Download Enterprise version 1.3.1 - E.G.Mellodew. 1998-2005 UK. Sap Release 758
