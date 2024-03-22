'use client'

import React, { useEffect, useState } from 'react'
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TaskEditor } from './TaskEditor'
import { TaskWith } from '@/types'
import { fetchTaskWithProject, updateTaskStatus } from './ApiReqProject'

interface CreatePageProps {
  projectId: string
}

// Main
export const TaskList: React.FC<CreatePageProps> = ({ projectId }) => {
  const [isOpen, setIsOpen] = useState(false) // ダイアログの開閉状態
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [data, setTask] = React.useState<TaskWith[]>([])
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const handleEditButtonClick = (taskId: string) => {
    setEditingTaskId(taskId)
    setIsOpen(true)
  }

  // 初回読み出し時に、Inputに値を入力する
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/tasks/projectwith/${projectId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        if (response.ok) {
          const fetchData = await response.json()
          setTask(fetchData.tasks)
          // router.refresh()
        } else {
          // エラーハンドリング
          console.error('Status update failed')
        }
      } catch (error) {
        console.error('Error updating project status:', error)
      }
    }
    fetchData()
  }, [])

  // -------カラムの定義
  const columns: ColumnDef<TaskWith>[] = [
    // タスク名列
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => row.getValue('name'),
    },

    // ディレクター名列
    {
      id: 'director',
      header: 'Director',
      accessorFn: (row) => row.director.name,
      cell: ({ getValue }) => getValue(), // ここでgetValue()を直接呼び出す
    },

    // マネージャー列（複数のマネージャー名をスラッシュで区切って表示）
    {
      id: 'managers',
      header: 'Managers',
      accessorFn: (row) => {
        // マネージャーの名前をスラッシュで結合
        const managerNames = row.managers
          .map((manager) => manager.name)
          .join(' / ')
        // 20文字を超える場合は省略
        return managerNames.length > 20
          ? `${managerNames.substring(0, 20)}...`
          : managerNames
      },
      cell: ({ getValue }) => getValue(), // ここでgetValue()を直接呼び出す
    },

    // ステータス列
    {
      id: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      accessorFn: (row) => row.status.name,
      cell: ({ getValue }) => getValue(), // ここでgetValue()を直接呼び出す
    },

    // 開始日
    {
      id: 'startDate',
      accessorKey: 'startDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Start
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('startDate'))
        const formattedDate = new Intl.DateTimeFormat('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date)
        return <span>{formattedDate}</span>
      },
    },

    // 終了日
    {
      id: 'endDate',
      accessorKey: 'endDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            End
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('endDate'))
        const formattedDate = new Intl.DateTimeFormat('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date)
        return <span>{formattedDate}</span>
      },
    },

    // 更新日
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Update
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('updatedAt'))
        const formattedDate = new Intl.DateTimeFormat('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date)
        return <span>{formattedDate}</span>
      },
    },
    {
      id: 'edit',
      enableHiding: false,
      cell: ({ row }) => {
        const task = row.original
        return (
          <>
            <button onClick={() => handleEditButtonClick(task.id)}>Edit</button>
            {isOpen && editingTaskId === task.id && (
              <TaskEditor
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                task={task}
                projectId={projectId}
                setTask={setTask}
              />
            )}
          </>
        )
      },
    },
    // アクションメニュー
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const task = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* ドロップダウンの見出し */}
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              {/* 水平線 */}
              <DropdownMenuSeparator />

              {/* ステータス更新ボタン */}
              {/* ステータスのIDをハードコーディングしているが。。。 */}
              <DropdownMenuItem
                onClick={() =>
                  updateTaskStatus(task.id, 'cltwhuh7e00056gcdobbzou8h', projectId, setTask)
                }
              >
                完了にする
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  updateTaskStatus(task.id, 'cltwhurp900076gcdgcamm5wl', projectId, setTask)
                }
              >
                停止中にする
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  updateTaskStatus(task.id, 'cltwhuly800066gcdfghzoo9a', projectId, setTask)
                }
              >
                進行中にする
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter names..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        <a href={`/project/taskadd/${projectId}`} className="ml-auto">
          <Button>Create Task</Button>
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-4">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}