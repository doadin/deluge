from __future__ import print_function

import glob
import os
import platform
import re
import shutil
import sys

from win32verstamp import stamp

import deluge.common

build_version = deluge.common.get_version()
build_bitness = platform.architecture()[0]
#build_dir = os.path.join('build-win32', 'deluge-bbfreeze-' + build_version)
build_dir = os.path.join('build-win32', 'Deluge')
#build_dir = 'build\Deluge'

# Create the install and uninstall file list for NSIS.
filedir_list = []
for root, dirnames, filenames in os.walk(build_dir):
    dirnames.sort()
    filenames.sort()
    filedir_list.append((root[len(build_dir) :], filenames))

with open('VERSION.tmp', 'w') as ver_file:
    ver_file.write('build_version = "%s"' % build_version)
    ver_file.write('build_bitness = "%s"' % build_bitness)

with open('install_files.nsh', 'w') as f:
    f.write('; Files to install\n')
    for dirname, files in filedir_list:
        if not dirname:
            dirname = os.sep
        f.write('\nSetOutPath "$INSTDIR%s"\n' % dirname)
        for filename in files:
            f.write('File build-win32\Deluge%s\n' % os.path.join(dirname, filename))

with open('uninstall_files.nsh', 'w') as f:
    f.write('; Files to uninstall\n')
    for dirname, files in reversed(filedir_list):
        f.write('\n')
        if not dirname:
            dirname = os.sep
        for filename in files:
            f.write('Delete "$INSTDIR%s"\n' % os.path.join(dirname, filename))
        f.write('RMDir "$INSTDIR%s"\n' % dirname)