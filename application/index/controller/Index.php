<?php
namespace app\index\controller;

use think\Controller;
use think\exception\DbException;
use think\Request;
use think\facade\Env;
use app\index\model\Museum;

class Index extends Controller
{
    public function index()
    {
        return $this->fetch('index');
    }

    public function hello($name = 'ThinkPHP5')
    {
        return Env::get('root_path') . 'static' . DIRECTORY_SEPARATOR . 'uploads';
    }

    /**
     * Finds all objects in the collection
     * @throws DbException
     */
    public function findAll()
    {
        $data = Museum::all();
        return json($data, 200, ['Access-Control-Allow-Origin' => '*']);
    }

    /**
     * Finds one object based on its ID and returns it
     * @param Request $request
     * @return null|\think\response\Json
     * @throws DbException
     */
    public function findOne($id)
    {
        $museum = Museum::get($id);
        return json($museum)->header(['Access-Control-Allow-Origin' => '*']);
    }

    /**
     * Updates an object based on its ID
     * @param Request $request
     * @return \think\response\Json
     * @throws DbException
     */
    public function update(Request $request)
    {
        $id = $request->post('id');
        $description = $request->post('description');
        $museum = Museum::get($id);
        $museum->description = $description;
        $museum->save();
        return json('success')->header(['Access-Control-Allow-Origin' => '*']);
    }

    /**
     * Deletes an object based on its ID
     * returns 'success' in case when deleted
     * and 'failed' when not
     * @param Request $request
     * @return \think\response\Json
     * @throws DbException
     */
    public function delete(Request $request)
    {
        $id = $request->post('id');
        $museum = Museum::get($id);
        if($museum) {
            $museum->delete();
            return json('success')->header(['Access-Control-Allow-Origin' => '*']);
        } else {
            return json('failed')->header(['Access-Control-Allow-Origin' => '*']);
        }
    }

    /**
     * Creates new object with request
     * parameter and returns and a JSON
     * string 'success'
     * @param Request $request
     * @return string|\think\response\Json
     */
    public function create(Request $request)
    {
        $x3d = $request->file('x3d');
        $img = $request->file('img');
        $video = $request->file('video');
        $des = $request->post('description');
        if (empty($x3d) || empty($img) || empty($video)) {
            return 'Please upload x3d or image or video';
        }
        $info1 = $x3d->move(Env::get('root_path') . 'static' . DIRECTORY_SEPARATOR . 'uploads');
        $x3d_path = '../static/uploads/'.str_replace('\\', '/', $info1->getSaveName());
        $info2 = $img->move(Env::get('root_path') . 'static' . DIRECTORY_SEPARATOR . 'uploads');
        $img_path = '../static/uploads/'.str_replace('\\', '/', $info2->getSaveName());
        $info3 = $video->move(Env::get('root_path') . 'static' . DIRECTORY_SEPARATOR . 'uploads');
        $video_path = '../static/uploads/'.str_replace('\\', '/', $info3->getSaveName());

        $museum = new Museum;
        $museum->x3d = $x3d_path;
        $museum->img = $img_path;
        $museum->video = $video_path;
        $museum->description = $des;

        if($museum->save()){
            return json('success')->header(['Access-Control-Allow-Origin' => '*']);
        } else {
            return $museum->getError();
        }

    }

}
