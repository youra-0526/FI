``` abap
*&---------------------------------------------------------------------*
*& Include ZC103FIR0016TOP                          - Report ZC103FIR0016
*&---------------------------------------------------------------------*
REPORT zc103fir0016 MESSAGE-ID zmsgc103.

*************************************
* Tables
*************************************
TABLES : zc103fit0001, zc103fit0002, zc103fit0003.

**********************************************************************
* Class Instance
**********************************************************************
DATA: go_container  TYPE REF TO cl_gui_custom_container,
      go_base_cont  TYPE REF TO cl_gui_splitter_container,
      go_left_cont  TYPE REF TO cl_gui_container,
      go_right_cont TYPE REF TO cl_gui_container,
      go_alv_grid   TYPE REF TO cl_gui_alv_grid.

DATA : go_tree_grid TYPE REF TO cl_gui_alv_grid,
       go_tree      TYPE REF TO cl_gui_simple_tree.

**********************************************************************
* 트리선언
**********************************************************************
TYPES: node_table_type LIKE STANDARD TABLE OF mtreesnode
                       WITH DEFAULT KEY.
DATA: node_table TYPE node_table_type.

**********************************************************************
* Declaration area for Tree event
**********************************************************************
DATA: events TYPE cntl_simple_events,
      event  TYPE cntl_simple_event.

*************************************
* Itab and wa
*************************************
*-- For ALV
DATA : BEGIN OF gs_body.
         INCLUDE STRUCTURE zc103fit0002.
DATA :   monat        TYPE zc103fit0021-monat,
         status       TYPE icon_d,
         modi_yn      TYPE c,
         cell_tab     TYPE lvc_t_styl,
         txt50        TYPE zc103fit0003-txt50, "계정이름
         debit_amt    TYPE wrbtr, "차변잔액
         debit_waers  TYPE waers, "차변통화
         credit_amt   TYPE wrbtr, "대변잔액
         credit_waers TYPE waers, "대변통화
         bktxt        TYPE zc103fit0001-bktxt,
         blarttxt(10),            "전표 유형 필드 description
         koarttxt(10),            "계정 유형 필드 description
       END OF gs_body,
       gt_body    LIKE TABLE OF gs_body,
*-- Selected data 출력용(tree에서 선택된 data)
       gt_display LIKE TABLE OF gs_body,
       gs_display LIKE gs_body.

DATA : gs_item TYPE zc103fit0002,
       gt_item TYPE TABLE OF zc103fit0002.

*-- For tree
DATA : BEGIN OF gs_tree,
         gjahr TYPE zc103fit0002-gjahr, "회계연도
         hkont TYPE zc103fit0002-hkont, "계정번호
         txt50 TYPE zc103fit0003-txt50, "계정이름
       END OF gs_tree,
       gt_tree LIKE TABLE OF gs_tree.

*-- box에 계정정보 출력하기 위함
DATA : gt_glinfo LIKE TABLE OF gs_body,
       gs_glinfo LIKE gs_body.

*-- For Domain value table (Sencondary Key table)
DATA : BEGIN OF gs_dd07v,
         domvalue_l TYPE domvalue_l,
         ddtext     TYPE val_text,
       END OF gs_dd07v,
       gt_dd07v LIKE TABLE OF gs_dd07v WITH NON-UNIQUE SORTED KEY key COMPONENTS domvalue_l.

*************************************
* For ALV
*************************************
DATA : gs_fcat    TYPE lvc_s_fcat,
       gt_fcat    TYPE lvc_t_fcat,
       gs_layout  TYPE lvc_s_layo,
       gs_variant TYPE disvariant.

**********************************************************************
* Common variable
**********************************************************************
DATA : gv_okcode          TYPE sy-ucomm,
       gv_cprog           TYPE sy-cprog,
       gv_dynnr           TYPE sy-dynnr,
*-- 계정정보 출력을 위함(계정이름, 차변잔액, 대변잔액, 합계)
       gv_accountname(10),            "계정이름
       gv_hkont           TYPE hkont, "계정번호
       gv_debit           TYPE wrbtr, "차변잔액
       gv_credit          TYPE wrbtr, "대변잔액
       gv_sum             TYPE wrbtr, "합계
       gv_cuky1           TYPE waers VALUE 'KRW', "차변통화
       gv_cuky2           TYPE waers VALUE 'KRW', "대변통화
       gv_cuky3           TYPE waers VALUE 'KRW'. "합계통화
