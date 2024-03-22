'use client'
import Header from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'
import { Container } from '@/components/Container'
import { useEffect, useRef, useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  Clients,
  Departments,
  Devices,
  Projects,
  Status,
  Systems,
  User,
} from '@prisma/client'
import ProjectList from './ProjectList'
import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'

// System モデルに関連付けられた Client モデルのデータを含む
type ProjectWith = Projects & {
  device: Devices & {
    system: Systems & {
      client: Clients
    }
  }
} & {
  director: User & {
    department: Departments
  }
} & {
  status: Status
}

const SearchComponent: React.FC = () => {
  // 入力をフックスで監視
  const [searchResults, setSearchResults] = useState<ProjectWith[]>([])
  const clientRef = useRef<HTMLInputElement | null>(null)
  const directorRef = useRef<HTMLInputElement | null>(null)
  const systemRef = useRef<HTMLInputElement | null>(null)
  const deviceRef = useRef<HTMLInputElement | null>(null)
  const projectRef = useRef<HTMLInputElement | null>(null)


  // side barの監視(虫眼鏡の画像をクリックすると検索バーが表示される)
  const [open, setOpen] = useState(false)

  // useEffectフックを使用して、コンポーネントがマウントされた時に実行される処理を定義します
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/projects')
        const data = await response.json()
        // 取得したデータでsystemsステートを更新します
        setSearchResults(data.projects)
      } catch (error) {
        console.error('システムの取得に失敗しました:', error)
      }
    }

    fetchSystems()
  }, []) // 依存配列を空にすることで、コンポーネントがマウントされた時にのみ実行されます

  // 検索処理を行う関数　※入力変更のたびに呼び出されてしまう。検索ボタンの方が良いか？
  const handleSearch = async (searchTerm: string) => {
    let url = 'http://localhost:3000/api/projects'
    if (searchTerm.trim() !== '') {
      url += `/search/${clientRef.current!.value}&${directorRef.current!.value}&${systemRef.current!.value}&${deviceRef.current!.value}&${projectRef.current!.value}`
    }
    const response = await fetch(url)
    const data = await response.json()
    setSearchResults(data.projects) // 検索結果でステートを更新
  }

  return (
    <>
      <Header />
      <main className="pt-14">
        <Container>
          {/* ページヘッダー */}
          <div className="sm:flex sm:items-center">
            <div className="border-b border-gray-300 dark:border-gray-500 sm:flex-auto">
              <h1 className="pt-4 text-3xl font-semibold text-gray-900 dark:text-slate-200">
                All Projects
              </h1>
              <p className="pb-2 text-xs text-gray-500">プロジェクト一覧</p>
              <p className="pb-2 text-sm leading-4 text-gray-900 dark:text-slate-200">
                {/* Client: {project?.device.system.client.name}　&gt;　System:{' '}
                {project?.device.system.name}　&gt;　Device:{' '}
                {project?.device.name}　&gt;　Project: {project?.name} */}
              </p>
            </div>
          </div>
        </Container>

        {/* 検索アイコン */}
        <div className="fixed right-10 top-20 cursor-pointer">
          <MagnifyingGlassIcon
            onClick={() => setOpen(true)}
            className="inline-block h-12 w-12 rounded-full bg-slate-100 p-2 shadow-md hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-950"
          />
        </div>
        {/* 新規追加アイコン */}
        <div className="fixed right-10 top-36 cursor-pointer">
          <PlusIcon
            onClick={() => setOpen(true)}
            className="inline-block h-12 w-12 rounded-full bg-slate-100 p-2 shadow-md hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-950"
          />
        </div>

        {/* サイドバー */}
        <Transition.Root show={open} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setOpen}>
            <div className="fixed inset-0 shadow-lg" />
            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                      <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl dark:bg-slate-700">
                        <div className="px-4 pt-16 sm:px-6">
                          <div className="flex items-start justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-gray-900 dark:text-slate-200">
                              検索
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-slate-800"
                                onClick={() => setOpen(false)}
                              >
                                <span className="absolute -inset-2.5" />
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="relative mt-6 flex-1 px-4 sm:px-6">
                          <div className="space-y-4">
                            {/* 検索フォーム */}
                            <div className="grid grid-cols-4 gap-4">
                              <div className="col-span-1">
                                <h2 className="text-base text-gray-900 dark:text-slate-200">
                                  企業名
                                </h2>
                              </div>

                              <div className="col-span-3">
                                <input
                                  type="text"
                                  onChange={(e) => handleSearch(e.target.value)}
                                  ref={clientRef}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800 dark:text-slate-200 sm:text-sm sm:leading-6"
                                  placeholder="検索..."
                                />
                              </div>

                              <div className="col-span-1">
                                <h2 className="text-base text-gray-900 dark:text-slate-200">
                                  責任者
                                </h2>
                              </div>

                              <div className="col-span-3">
                                <input
                                  type="text"
                                  onChange={(e) => handleSearch(e.target.value)}
                                  ref={directorRef}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800 dark:text-slate-200 sm:text-sm sm:leading-6"
                                  placeholder="検索..."
                                />
                              </div>

                              <div className="col-span-1">
                                <h2 className="text-base text-gray-900 dark:text-slate-200">
                                  設備名
                                </h2>
                              </div>

                              <div className="col-span-3">
                                <input
                                  type="text"
                                  onChange={(e) => handleSearch(e.target.value)}
                                  ref={systemRef}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800 dark:text-slate-200 sm:text-sm sm:leading-6"
                                  placeholder="検索..."
                                />
                              </div>

                              <div className="col-span-1">
                                <h2 className="text-base text-gray-900 dark:text-slate-200">
                                  装置名
                                </h2>
                              </div>

                              <div className="col-span-3">
                                <input
                                  type="text"
                                  onChange={(e) => handleSearch(e.target.value)}
                                  ref={deviceRef}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800 dark:text-slate-200 sm:text-sm sm:leading-6"
                                  placeholder="検索..."
                                />
                              </div>

                              <div className="col-span-1">
                                <h2 className="text-base text-gray-900 dark:text-slate-200">
                                  プロジェクト名
                                </h2>
                              </div>

                              <div className="col-span-3">
                                <input
                                  type="text"
                                  onChange={(e) => handleSearch(e.target.value)}
                                  ref={projectRef}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800 dark:text-slate-200 sm:text-sm sm:leading-6"
                                  placeholder="検索..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* リストのコンポーネントを常時更新 */}
        <ProjectList searchProjects={searchResults} />
      </main>
      <Footer />
    </>
  )
}

export default SearchComponent
