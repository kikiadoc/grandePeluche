#! /bin/bash
grep -n "$1" dev/front/src/transition/*
grep -n "$1" dev/infraback/*
grep -n "$1" dev/inframain/*
grep -n "$1" checksec/*
